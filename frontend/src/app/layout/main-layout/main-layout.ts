import { Component, HostListener, OnInit, inject, NgZone, OnDestroy, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavigationService } from '../../core/services/navigation';
import { ThemeService } from '../../core/services/theme';
import { AuthService } from '../../core/services/auth';
import { ChatService } from '../../core/services/chat'; 
import { Subscription, filter } from 'rxjs';
import { ConversationDto, ChatMessageDto } from '../../shared/models/dtos';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  // Injected Services
  navService = inject(NavigationService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  chatService = inject(ChatService); 
  router = inject(Router);
  ngZone = inject(NgZone);
  renderer = inject(Renderer2);

  // Component State
  menuItems = this.navService.menuItems;
  currentUser = this.authService.currentUser; 
  
  // --- STATE MANAGEMENT REFACTOR ---
  isSidebarCollapsed = false;        // For desktop view
  isSidebarOpenOnMobile = false;    // For mobile overlay view
  isMobileView = false;             // Tracks if we are in mobile layout
  
  isHeaderHidden = false;
  lastScrollTop = 0;
  private readonly sidebarStorageKey = 'app_sidebar_collapsed';

  // Chat / Notifications
  unreadConversations: ConversationDto[] = [];
  totalUnreadCount = 0;
  isMessagesDropdownOpen = false;
  private subs: Subscription[] = [];

  ngOnInit() {
    this.chatService.ensureConnection();
    this.refreshNotifications();

    // Chat Subscriptions
    const sub1 = this.chatService.totalUnreadCount$.subscribe(count => this.totalUnreadCount = count);
    const sub2 = this.chatService.messageReceived$.subscribe((msg: ChatMessageDto) => {
      this.ngZone.run(() => {
        const myId = this.currentUser()?.id;
        
        // Safety check for user existence
        if (!myId) return;

        // 1. Ignore my own messages
        if (Number(msg.sender.id) === Number(myId)) {
            return; 
        }
        
        // 2. Ignore if this chat is currently OPEN (User is reading it)
        if (this.chatService.activeConversationId === msg.conversation_id) return;

        // OPTIMISTIC UPDATE
        const existingConvo = this.unreadConversations.find(c => c.id === msg.conversation_id);
        
        if (existingConvo) {
            // Update existing item
            existingConvo.unread_count = (existingConvo.unread_count || 0) + 1;
            existingConvo.last_message = msg;
            
            // Move to top
            this.unreadConversations = [
                existingConvo,
                ...this.unreadConversations.filter(c => c.id !== existingConvo.id)
            ];
            
            // Increment Global Count
            const currentTotal = this.chatService.totalUnreadCount$.value;
            this.chatService.totalUnreadCount$.next(currentTotal + 1);

        } else {
            // New conversation? Fetch details to get name/avatar correctly
            // Temporarily increment count
            const currentTotal = this.chatService.totalUnreadCount$.value;
            this.chatService.totalUnreadCount$.next(currentTotal + 1);
            
            this.refreshNotifications();
        }
      });
    });
    
    // Close mobile sidebar on navigation
    const sub3 = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobileView) {
        this.isSidebarOpenOnMobile = false;
      }
    });
    
    this.subs.push(sub1, sub2, sub3);
  }

  ngAfterViewInit() {
    // Check initial screen size after the view is ready
    this.checkScreenWidth();
    //  Load sidebar state from localStorage
    setTimeout(() => {
      this.loadSidebarState();
    }, 0);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // --- SIDEBAR & HEADER LOGIC ---

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenWidth();
  }

  private checkScreenWidth() {
    // Using a common breakpoint (e.g., 992px)
    this.isMobileView = window.innerWidth < 992;
    if (!this.isMobileView) {
      // Ensure mobile overlay is closed if we resize to desktop
      this.isSidebarOpenOnMobile = false; 
    }
  }

  private loadSidebarState() {
    if (!this.isMobileView) {
      const savedState = localStorage.getItem(this.sidebarStorageKey);
      this.isSidebarCollapsed = savedState === 'true';
    }
  }

  toggleSidebar() {
    if (this.isMobileView) {
      // On mobile, we toggle the overlay
      this.isSidebarOpenOnMobile = !this.isSidebarOpenOnMobile;
    } else {
      // On desktop, we toggle the collapse state and save it
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      localStorage.setItem(this.sidebarStorageKey, String(this.isSidebarCollapsed));
    }
  }

  // Called from the backdrop click
  closeMobileSidebar() {
    this.isSidebarOpenOnMobile = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // Hide header if scrolling down, past the header's height
    if (scrollTop > this.lastScrollTop && scrollTop > 80) {
      this.isHeaderHidden = true;
    } else if (scrollTop < this.lastScrollTop) { // Show if scrolling up
      this.isHeaderHidden = false;
    }
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  // --- USER & CHAT METHODS ---
  
  get userInitials(): string {
    const name = this.currentUser()?.full_name || this.currentUser()?.email || 'U';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }
  
  logout() { this.authService.logout(); }
  
  refreshNotifications() {
    const user = this.currentUser();
    if (!user) return;

    // STRICT TYPING: Expect ConversationDto array
    this.chatService.getConversations().subscribe((convos: ConversationDto[]) => {
      
      // Filter only those with unread messages
      this.unreadConversations = convos.filter(c => (c.unread_count || 0) > 0);
      
      // Update the total observable
      const total = this.unreadConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      this.chatService.totalUnreadCount$.next(total);
    });
  }
  
  toggleMessagesDropdown() {
    this.isMessagesDropdownOpen = !this.isMessagesDropdownOpen;
    if (this.isMessagesDropdownOpen) {
        this.refreshNotifications(); // Refresh on open to be sure
    }
  }
  
  openChat(convoId?: number) {
    this.isMessagesDropdownOpen = false;
    if (convoId) {
        this.router.navigate(['/chat'], { queryParams: { id: convoId } });
    } else {
        this.router.navigate(['/chat']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const inside = target.closest('.header__messages-wrapper');
    if (!inside) {
      this.isMessagesDropdownOpen = false;
    }
  }
  
 
  /**
   * Helper function to get only the visible children of a menu item.
   * This is used in the template to prevent rendering empty groups.
  getVisibleChildren(item: AppRouteConfig): AppRouteConfig[] {
    return item.children?.filter(child => child.visible !== false) || [];
  }
   */

  /**
   * Helper to determine the primary route for a parent item.
   * It finds the first visible child's route.
  getParentRoute(item: AppRouteConfig): string | null {
    if (!item.children) return item.path;
    const firstVisibleChild = item.children.find(child => child.visible !== false);
    return firstVisibleChild ? firstVisibleChild.path : null;
  }
   */
}
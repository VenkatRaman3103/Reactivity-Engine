export let activeTab = 'signals';
export let isSidebarOpen = true;
export let theme: 'dark' | 'light' = 'dark';

export function setActiveTab(tab: string) {
  activeTab = tab;
  if (window.innerWidth <= 1024) isSidebarOpen = false; // Close only on mobile
}

export function toggleSidebar() {
  isSidebarOpen = !isSidebarOpen;
}

export function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

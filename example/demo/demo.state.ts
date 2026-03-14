export let activeTab = 'signals';
export let isSidebarOpen = true;
export let theme: 'dark' | 'light' = 'dark';

export function setActiveTab(tab: string) {
  activeTab = tab;
  isSidebarOpen = false; // Close on mobile when selecting
}

export function toggleSidebar() {
  isSidebarOpen = !isSidebarOpen;
}

export function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

import { Store } from '@tanstack/react-store'

interface SidebarState {
  isCollapsed: boolean
}

export const sidebarStore = new Store<SidebarState>({
  isCollapsed: false,
})

export const toggleSidebar = () => {
  sidebarStore.setState((state) => ({
    isCollapsed: !state.isCollapsed,
  }))
}

export const setSidebarCollapsed = (collapsed: boolean) => {
  sidebarStore.setState({
    isCollapsed: collapsed,
  })
}




import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { getTree } from "../../features/auth/api/auh-api"
import { getFromLocalStorage } from "../../shared/utils/local-storage-actions"

const RootLayout = () => {
    const loggedIn = getFromLocalStorage('token') || true
    if (!loggedIn) {
        return <Navigate to={'/auth'} />
    }
    return (
      <div>
        
      </div>
    )
  }
  
  export default RootLayout
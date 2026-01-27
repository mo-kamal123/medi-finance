export const getFromLocalStorage = (key) =>{
    return localStorage.getItem(key)
}

export const addToLocalStorage = (key,value) => {
    return localStorage.setItem(key, value)
}

export const removeFromLocalStorage = (key) => {
    return localStorage.removeItem(key)
}

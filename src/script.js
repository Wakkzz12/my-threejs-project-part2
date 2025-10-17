import './style.css'

// Activity selector
const activitySelect = document.getElementById('activitySelect')

activitySelect.addEventListener('change', async (e) => {
    const activityNum = e.target.value
    
    if (!activityNum) return
    
    // Clear the page
    const canvas = document.querySelector('canvas.webgl')
    const context = canvas.getContext('webgl') || canvas.getContext('webgl2')
    if (context) {
        const loseContext = context.getExtension('WEBGL_lose_context')
        if (loseContext) loseContext.loseContext()
    }
    
    // Remove all GUI elements
    const guiElements = document.querySelectorAll('.lil-gui')
    guiElements.forEach(el => el.remove())
    
    // Reload the page with the selected activity
    window.location.href = `${window.location.origin}?activity=${activityNum}`
})

// Load activity based on URL parameter
const urlParams = new URLSearchParams(window.location.search)
const activity = urlParams.get('activity')

if (activity) {
    activitySelect.value = activity
    
    // Load the corresponding activity
    switch(activity) {
        case '6':
            import('./activities/activity6.js')
            break
        case '7':
            import('./activities/activity7.js')
            break
        case '8':
            import('./activities/activity8.js')
            break
        case '9':
            import('./activities/activity9.js')
            break
        case '10':
            import('./activities/activity10.js')
            break
        case '11':
            import('./activities/activity11.js')
            break
    }
}
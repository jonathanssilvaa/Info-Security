// Centralized geolocation management to prevent infinite loops
class GeolocationManager {
  private location: [number, number] | null = null
  private isLoading = false
  private promise: Promise<[number, number]> | null = null
  private defaultLocation: [number, number] = [-23.5505, -46.6333]

  async getLocation(): Promise<[number, number]> {
    // Return cached location if available
    if (this.location) {
      return this.location
    }

    // Return existing promise if already loading
    if (this.promise) {
      return this.promise
    }

    // Create new promise for geolocation request
    this.promise = new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        this.location = this.defaultLocation
        this.promise = null
        resolve(this.defaultLocation)
        return
      }

      this.isLoading = true

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.location = [position.coords.latitude, position.coords.longitude]
          this.isLoading = false
          this.promise = null
          console.log("[v0] Geolocation obtained:", this.location)
          resolve(this.location)
        },
        (error) => {
          console.log("[v0] Geolocation error:", error.message)
          this.location = this.defaultLocation
          this.isLoading = false
          this.promise = null
          resolve(this.defaultLocation)
        },
        { timeout: 5000, maximumAge: 300000 }, // Cache for 5 minutes
      )
    })

    return this.promise
  }

  reset(): void {
    this.location = null
    this.promise = null
    this.isLoading = false
  }
}

export const geolocationManager = new GeolocationManager()

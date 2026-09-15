class WebSocketClient {
  constructor() {
    this.ws = null
    this.handlers = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.reconnectTimer = null
    this.isConnecting = false
  }

  connect(url) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isConnecting = true
    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.isConnecting = false
        this.emit('_connected', {})
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type) {
            this.emit(data.type, data)
          }
        } catch {
          this.emit('_raw_message', event.data)
        }
      }

      this.ws.onclose = (event) => {
        this.isConnecting = false
        this.emit('_disconnected', { code: event.code, reason: event.reason })
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(url)
        }
      }

      this.ws.onerror = () => {
        this.isConnecting = false
        this.emit('_error', {})
      }
    } catch {
      this.isConnecting = false
      this.scheduleReconnect(url)
    }
  }

  scheduleReconnect(url) {
    if (this.reconnectTimer) return
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect(url)
    }, delay)
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }

  on(event, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    this.handlers[event].push(handler)
  }

  off(event, handler) {
    if (!this.handlers[event]) return
    if (handler) {
      this.handlers[event] = this.handlers[event].filter(h => h !== handler)
    } else {
      delete this.handlers[event]
    }
  }

  emit(event, data) {
    if (!this.handlers[event]) return
    this.handlers[event].forEach(handler => {
      try {
        handler(data)
      } catch (e) {
        console.error(`WebSocket handler error for event "${event}":`, e)
      }
    })
  }

  get isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

const websocketClient = new WebSocketClient()

export default websocketClient
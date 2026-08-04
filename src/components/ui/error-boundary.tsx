import { Component } from "react"
import type { ReactNode, ErrorInfo } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="border-borderSubtle flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border bg-white p-8 text-center">
          <div className="bg-danger/8 flex h-12 w-12 items-center justify-center rounded-full">
            <span className="text-danger text-xl font-bold">!</span>
          </div>
          <div>
            <p className="font-jakarta text-brand text-sm font-semibold">Something went wrong</p>
            <p className="font-jakarta text-brand/50 mt-1 text-xs">
              {this.state.error?.message ?? "An unexpected error occurred"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={this.reset}>
              Try again
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                this.reset()
                window.location.href = "/"
              }}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle, RefreshCw, ArrowLeft, Check, Copy } from 'lucide-react'
import styled from 'styled-components'
import { Button } from '@/components/ui/button'

const ErrorContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
`

const ErrorCard = styled.div`
  width: 100%;
  max-width: 440px;
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
`

const ErrorTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
  line-height: 1.4;
`

const ErrorSubtitle = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  color: rgba(248, 250, 252, 0.55);
  text-align: center;
  line-height: 1.6;
`

const ErrorMessage = styled.div`
  padding: 12px 14px;
  margin-bottom: 20px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 10px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: rgba(248, 113, 113, 0.9);
  line-height: 1.6;
  word-break: break-all;
  max-height: 120px;
  overflow-y: auto;
`

const StackTrace = styled.details`
  margin-bottom: 20px;
  
  summary {
    cursor: pointer;
    font-size: 12px;
    color: rgba(248, 250, 252, 0.5);
    padding: 8px 0;
    user-select: none;
    list-style: none;
    
    &::-webkit-details-marker {
      display: none;
    }
    
    &::before {
      content: '▸ ';
      font-size: 10px;
      margin-right: 4px;
    }
  }
  
  &[open] summary::before {
    content: '▾ ';
  }
  
  pre {
    margin: 8px 0 0;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    font-size: 11px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: rgba(248, 250, 252, 0.6);
    line-height: 1.6;
    overflow-x: auto;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleReset}
          onReload={this.handleReload}
        />
      )
    }
    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  statusCode?: number
  statusText?: string
  onRetry?: () => void
  onReload?: () => void
  onBack?: () => void
}

export function ErrorFallback({
  error,
  statusCode,
  statusText,
  onRetry,
  onReload,
  onBack,
}: ErrorFallbackProps) {
  const [copied, setCopied] = useState(false)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  const handleReload = () => {
    if (onReload) {
      onReload()
    } else {
      window.location.reload()
    }
  }

  const handleCopyStack = async () => {
    if (!error?.stack) return
    try {
      await navigator.clipboard.writeText(error.stack)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (copyError) {
      console.error('Failed to copy error stack', copyError)
    }
  }

  const title = statusCode
    ? `${statusCode} - ${statusText || '请求错误'}`
    : '页面出现异常'

  const subtitle = statusCode
    ? '访问资源时发生错误，请稍后重试或返回首页'
    : '组件渲染过程中发生错误，您可以尝试刷新页面'

  return (
    <ErrorContainer>
      <ErrorCard>
        <IconWrapper>
          <AlertTriangle size={28} strokeWidth={1.8} />
        </IconWrapper>
        <ErrorTitle>{title}</ErrorTitle>
        <ErrorSubtitle>{subtitle}</ErrorSubtitle>

        {error?.message && (
          <ErrorMessage>{error.message}</ErrorMessage>
        )}

        {!error?.message && statusCode && (
          <ErrorMessage>{`${statusCode} ${statusText || ''}`.trim()}</ErrorMessage>
        )}

        {error?.stack && (
          <StackTrace>
            <summary>查看错误堆栈</summary>
            <pre>{error.stack}</pre>
          </StackTrace>
        )}

        <ButtonGroup>
          {error?.stack && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyStack}
              className="gap-1.5"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '已复制' : '复制堆栈'}
            </Button>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5"
            >
              <RefreshCw size={14} />
              重试
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-1.5"
          >
            <ArrowLeft size={14} />
            返回
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleReload}
            className="gap-1.5"
          >
            <RefreshCw size={14} />
            刷新
          </Button>
        </ButtonGroup>
      </ErrorCard>
    </ErrorContainer>
  )
}

export function RouteErrorElement() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        error={null}
        statusCode={error.status}
        statusText={error.statusText}
      />
    )
  }

  const err = error instanceof Error
    ? error
    : new Error(typeof error === 'string' ? error : '发生未知错误')

  return <ErrorFallback error={err} />
}

export default ErrorBoundary

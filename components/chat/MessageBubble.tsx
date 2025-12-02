'use client'

import { User, Bot } from 'lucide-react'
import { Mensaje } from '@/types'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageBubbleProps {
  mensaje: Mensaje
}

export function MessageBubble({ mensaje }: MessageBubbleProps) {
  const esUsuario = mensaje.rol === 'user'
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Detectar si el tema es oscuro
    const checkDarkMode = () => {
      const root = document.documentElement
      setIsDark(root.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Observar cambios en la clase dark
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`
        flex gap-4 mb-8
        ${esUsuario ? 'flex-row-reverse' : 'flex-row'}
      `}
    >
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${esUsuario ? 'bg-primary' : 'bg-secondary'}
        `}
      >
        {esUsuario ? (
          <User size={20} className="text-white" />
        ) : (
          <Bot size={20} className="text-white" />
        )}
      </div>
      <div className={`flex-1 ${esUsuario ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
        <div
          className={`
            rounded-2xl px-5 py-4 max-w-[85%] w-full
            ${
              esUsuario
                ? 'bg-primary text-white'
                : 'bg-background-secondary dark:bg-background-secondary text-foreground dark:text-foreground border border-border/50 dark:border-border/50 shadow-sm'
            }
          `}
        >
          {esUsuario ? (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap break-words m-0 text-white leading-relaxed">
                {mensaje.contenido}
              </p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground dark:prose-headings:text-foreground prose-p:text-foreground dark:prose-p:text-foreground prose-strong:text-foreground dark:prose-strong:text-foreground prose-a:text-primary dark:prose-a:text-primary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }: { children: React.ReactNode }) => (
                    <div className="overflow-x-auto my-4 -mx-2">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border border-border dark:border-border rounded-lg">
                          <table className="min-w-full divide-y divide-border dark:divide-border">
                            {children}
                          </table>
                        </div>
                      </div>
                    </div>
                  ),
                  thead: ({ children }: { children: React.ReactNode }) => (
                    <thead className="bg-background-tertiary dark:bg-background-tertiary">
                      {children}
                    </thead>
                  ),
                  th: ({ children }: { children: React.ReactNode }) => (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-foreground dark:text-foreground uppercase tracking-wider border-b border-border dark:border-border">
                      {children}
                    </th>
                  ),
                  td: ({ children }: { children: React.ReactNode }) => (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground dark:text-foreground border-b border-border/50 dark:border-border/50">
                      {children}
                    </td>
                  ),
                  tr: ({ children }: { children: React.ReactNode }) => (
                    <tr className="hover:bg-background-tertiary/30 dark:hover:bg-background-tertiary/30 transition-colors">
                      {children}
                    </tr>
                  ),
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '')
                    const language = match ? match[1] : ''
                    const codeString = String(children).replace(/\n$/, '')

                    return !inline && match ? (
                      <div className="my-4 -mx-2">
                        {mounted && (
                          <SyntaxHighlighter
                            language={language}
                            style={isDark ? oneDark : oneLight}
                            PreTag="div"
                            className="rounded-lg !m-0"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              padding: '1rem',
                              fontSize: '0.875rem',
                              lineHeight: '1.5',
                            }}
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        )}
                        {!mounted && (
                          <pre className="bg-background-tertiary dark:bg-background-tertiary p-4 rounded-lg overflow-x-auto my-4">
                            <code className={className}>{codeString}</code>
                          </pre>
                        )}
                      </div>
                    ) : (
                      <code
                        className="bg-background-tertiary dark:bg-background-tertiary text-primary dark:text-primary px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  p: ({ children }: { children: React.ReactNode }) => (
                    <p className="my-3 leading-7 text-foreground dark:text-foreground">
                      {children}
                    </p>
                  ),
                  ul: ({ children }: { children: React.ReactNode }) => (
                    <ul className="my-3 ml-6 list-disc space-y-1 text-foreground dark:text-foreground">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }: { children: React.ReactNode }) => (
                    <ol className="my-3 ml-6 list-decimal space-y-1 text-foreground dark:text-foreground">
                      {children}
                    </ol>
                  ),
                  li: ({ children }: { children: React.ReactNode }) => (
                    <li className="my-1.5 leading-6 text-foreground dark:text-foreground">
                      {children}
                    </li>
                  ),
                  h1: ({ children }: { children: React.ReactNode }) => (
                    <h1 className="text-2xl font-bold my-4 text-foreground dark:text-foreground leading-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }: { children: React.ReactNode }) => (
                    <h2 className="text-xl font-bold my-3 text-foreground dark:text-foreground leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }: { children: React.ReactNode }) => (
                    <h3 className="text-lg font-semibold my-3 text-foreground dark:text-foreground leading-tight">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }: { children: React.ReactNode }) => (
                    <h4 className="text-base font-semibold my-2 text-foreground dark:text-foreground">
                      {children}
                    </h4>
                  ),
                  blockquote: ({ children }: { children: React.ReactNode }) => (
                    <blockquote className="border-l-4 border-primary dark:border-primary pl-4 my-4 italic text-foreground-secondary dark:text-foreground-secondary bg-background-tertiary/30 dark:bg-background-tertiary/30 py-2 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary dark:text-primary hover:underline font-medium"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }: { children: React.ReactNode }) => (
                    <strong className="font-semibold text-foreground dark:text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }: { children: React.ReactNode }) => (
                    <em className="italic text-foreground dark:text-foreground">{children}</em>
                  ),
                  hr: () => (
                    <hr className="my-6 border-t border-border dark:border-border" />
                  ),
                }}
              >
                {mensaje.contenido}
              </ReactMarkdown>
            </div>
          )}
          {mensaje.archivos_adjuntos && mensaje.archivos_adjuntos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20 dark:border-border/50">
              <p className="text-xs opacity-80 dark:opacity-70">
                {mensaje.archivos_adjuntos.length} archivo(s) adjunto(s)
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-foreground-muted dark:text-foreground-muted mt-2 px-1">
          {new Date(mensaje.creado_en).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}



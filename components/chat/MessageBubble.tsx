'use client'

import { User, Bot } from 'lucide-react'
import { Mensaje } from '@/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageBubbleProps {
  mensaje: Mensaje
}

export function MessageBubble({ mensaje }: MessageBubbleProps) {
  const esUsuario = mensaje.rol === 'user'

  return (
    <div
      className={`
        flex gap-3 mb-6
        ${esUsuario ? 'flex-row-reverse' : 'flex-row'}
      `}
    >
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${esUsuario ? 'bg-primary' : 'bg-secondary'}
        `}
      >
        {esUsuario ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>
      <div className={`flex-1 ${esUsuario ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            rounded-lg px-4 py-3 max-w-[80%] prose prose-sm dark:prose-invert
            ${
              esUsuario
                ? 'bg-primary dark:bg-primary text-white prose-headings:text-white prose-p:text-white prose-strong:text-white prose-code:text-white'
                : 'bg-background-secondary dark:bg-background-secondary text-foreground dark:text-foreground border border-border dark:border-border'
            }
          `}
        >
          {esUsuario ? (
            <p className="whitespace-pre-wrap break-words m-0">{mensaje.contenido}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="markdown-content"
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-border dark:border-border">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-background-tertiary dark:bg-background-tertiary">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="border border-border dark:border-border px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border dark:border-border px-4 py-2">
                    {children}
                  </td>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-background-tertiary/50 dark:hover:bg-background-tertiary/50">
                    {children}
                  </tr>
                ),
                code: ({ children, className }) => {
                  const esBloque = className?.includes('language-')
                  return esBloque ? (
                    <pre className="bg-background-tertiary dark:bg-background-tertiary p-4 rounded-lg overflow-x-auto my-4">
                      <code className={className}>{children}</code>
                    </pre>
                  ) : (
                    <code className="bg-background-tertiary dark:bg-background-tertiary px-1.5 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  )
                },
                p: ({ children }) => <p className="my-2">{children}</p>,
                ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-bold my-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold my-2">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary dark:border-primary pl-4 my-4 italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {mensaje.contenido}
            </ReactMarkdown>
          )}
          {mensaje.archivos_adjuntos && mensaje.archivos_adjuntos.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20 dark:border-white/20">
              <p className="text-xs opacity-80 dark:opacity-80">
                {mensaje.archivos_adjuntos.length} archivo(s) adjunto(s)
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-foreground-muted dark:text-foreground-muted mt-1">
          {new Date(mensaje.creado_en).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}



import jsPDF from 'jspdf'
import { Mensaje, Conversacion } from '@/types'

export function exportarConversacionAPDF(
  conversacion: Conversacion,
  mensajes: Mensaje[]
) {
  const doc = new jsPDF()
  const margen = 20
  const anchoPagina = doc.internal.pageSize.getWidth()
  const anchoContenido = anchoPagina - margen * 2
  let yPos = margen

  // Título
  doc.setFontSize(18)
  doc.setTextColor(255, 133, 123) // Color primary
  doc.text(conversacion.titulo, margen, yPos)
  yPos += 10

  // Fecha de creación
  doc.setFontSize(10)
  doc.setTextColor(163, 163, 163) // Color foreground secondary
  const fechaCreacion = new Date(conversacion.creado_en).toLocaleString('es-CL')
  doc.text(`Creado: ${fechaCreacion}`, margen, yPos)
  yPos += 15

  // Mensajes
  doc.setFontSize(12)
  mensajes.forEach((mensaje, index) => {
    // Verificar si necesitamos nueva página
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      yPos = margen
    }

    // Encabezado del mensaje
    doc.setFontSize(10)
    doc.setTextColor(163, 163, 163)
    const fechaMensaje = new Date(mensaje.creado_en).toLocaleString('es-CL')
    const rolTexto = mensaje.rol === 'user' ? 'Usuario' : 'Asistente'
    doc.text(`${rolTexto} - ${fechaMensaje}`, margen, yPos)
    yPos += 7

    // Contenido del mensaje
    doc.setFontSize(11)
    doc.setTextColor(250, 250, 250) // Color foreground
    const lineas = doc.splitTextToSize(mensaje.contenido, anchoContenido)
    lineas.forEach((linea: string) => {
      if (yPos > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        yPos = margen
      }
      doc.text(linea, margen, yPos)
      yPos += 7
    })

    yPos += 10 // Espacio entre mensajes
  })

  // Footer con crédito
  const totalPaginas = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(163, 163, 163)
    doc.text(
      `Desarrollado por AutomatizaFix - www.automatizafix.com`,
      margen,
      doc.internal.pageSize.getHeight() - 10
    )
  }

  return doc
}



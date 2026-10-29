import prisma from '../database/client.js'

// *** SOLUÇÃO XSS 2: Importação e configuração do DOMPurify ***
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

const controller = {}

controller.retrieveComments = async function(req, res) {
  try {
    const comments = await prisma.xssComment.findMany({
      orderBy: { id: 'asc' }
    })

    res.send(comments)
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

controller.createComment = async function(req, res) {
  try {
    // *** CORREÇÃO DE XSS: sanitização com DOMPurify ***
    // Remove do comentário atributos e elementos executáveis (onerror, <script> etc.)
    // antes de gravá-lo, mantendo apenas o HTML "seguro".
    // Junto com a CSP do front-end (index.html), forma uma dupla proteção contra XSS:
    // a CSP impede a execução de scripts injetados e a sanitização impede que sejam armazenados.
    const comment = DOMPurify.sanitize(req.body?.content ?? '')

    await prisma.xssComment.create({
      data: { content: comment }
    })

    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

export default controller

import prisma from '../database/client.js'

const controller = {}

controller.login = async function(req, res) {
  const username = req.body?.username ?? ''
  const password = req.body?.password ?? ''

  try {
    // *** CORREÇÃO DE SQL INJECTION: consulta parametrizada ***
    // $queryRaw, usado como tagged template, NÃO concatena os valores na string SQL:
    // o Prisma envia a consulta com marcadores (?) e transmite username e password
    // separadamente, como dados. Assim, aspas ou "or 1=1" informados pelo usuário
    // nunca são interpretados como instruções SQL.
    // (Evitar $queryRawUnsafe com entrada de usuário, pois ele reabre a vulnerabilidade.)
    // Seleciona só as colunas necessárias, sem expor a senha na resposta.
    const users = await prisma.$queryRaw`
      SELECT id, username, fullname, is_admin
      FROM "User"
      WHERE username = ${username} AND password = ${password}
    `

    if(users.length > 0) {
      return res.send({
        success: true,
        message: `Bem-vindo, ${username}!`,
        flag: 'VULCOM{SQLi_Exploit_Success}',
        result: users
      })
    }

    res.status(401).send({
      success: false,
      message: 'Login falhou!',
      result: users
    })
  }
  catch(error) {
    console.error(error)
    // A resposta de erro não revela mais a consulta SQL nem a estrutura da tabela.
    res.status(500).send({
      success: false,
      message: 'Erro no servidor'
    })
  }
}

export default controller

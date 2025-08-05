import express from 'express'
import cors from 'cors'
import { getAnswer } from './rag'

const port = 3333

const app = express()

app.use(cors())

app.use(express.json())

app.post('/question_answering', async (req, res) => {
    const question = req.body.question as string

    const response = await getAnswer(question)

    res.send(JSON.stringify({ response }))
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})


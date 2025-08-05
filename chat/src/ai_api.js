export default async function getResponse(prompt) {
  return fetch('http://localhost:3333/question_answering', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: prompt
    }),
  }).then((res) => res.json()).then((res) => res.response)
}

import { useState } from 'react'

function App() {
  const [header, setHeader] = useState({
    name: '',
    fontsize: '12',
    font: 'OFLSortsMillGoudy',
    width: '7.3',
    height: '11.7',
    clef: 'c3',
  })
  const [dialogue, setDialogue] = useState('regional')
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setHeader((prev) => ({ ...prev, [name]: value }))
  }

const handleSubmit = async () => {
  setLoading(true)
  setOutput('')

  try {
    const res = await fetch('https://gabcgen.fly.dev/preface', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ header, dialogue, text }),
    })

    const contentType = res.headers.get('content-type') || ''

    // Handle status codes
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const errData = await res.json()
        setOutput(`error code ${errData.error_code}: ${errData.error_message}`)
      } else {
        const errText = await res.text()
        setOutput(`Erro ${res.status} - ${res.statusText}: ${errText}`)
      }
      return
    }

    // On success
    const data = await res.json()
    setOutput(data.gabc || 'Nenhum conteúdo gabc retornado.')
  } catch (err) {
    console.error(err)
    setOutput('Erro ao conectar ao backend.')
  } finally {
    setLoading(false)
  }
}

const handleScore = async () => {
  const encodedText = encodeURIComponent(output);

  try {
    await open('https://www.sourceandsummit.com/editor/legacy/?crop=0#' + encodedText, {
  })
   } catch (err) {
    console.error(err)
    setOutput('Erro ao gerar partitura.')
  }
  
}  

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>PopeChant Generator</h1>

      <fieldset style={{ padding: '1rem', marginBottom: '1rem' }}>
        <legend>Header</legend>
        <input name="name" placeholder="Title" value={header.name} onChange={handleChange} style={{ width: '100%' }} />
        <input name="fontsize" placeholder="Font size" value={header.fontsize} onChange={handleChange} />
        <input name="font" placeholder="Font" value={header.font} onChange={handleChange} />
        <input name="width" placeholder="Width" value={header.width} onChange={handleChange} />
        <input name="height" placeholder="Height" value={header.height} onChange={handleChange} />
        <input name="clef" placeholder="Clef" value={header.clef} onChange={handleChange} />
      </fieldset>

      <div style={{ marginBottom: '1rem' }}>
        <label>Dialogue type: </label>
        <select value={dialogue} onChange={(e) => setDialogue(e.target.value)}>
          <option value="regional">Regional</option>
          <option value="roman">Roman</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Preface:</label>
        <textarea
          rows={10}
          style={{ width: '100%', padding: '0.75rem' }}
          placeholder="Digite o texto litúrgico aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
        {loading ? 'Enviando...' : 'Gerar GABC'}
      </button>

     <h2 style={{ marginTop: '2rem' }}>Resultado:</h2>
        <textarea
          rows={10}
          style={{ width: '100%', padding: '0.75rem', minHeight: '200px', whiteSpace: 'pre-wrap' }}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
        />
      <button onClick={handleScore}
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
> Gerar partitura
</button>

    </div>
  )
}

export default App

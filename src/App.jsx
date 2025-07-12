import { useState, useRef } from 'react';

const headerFields = [
  {
    name: 'name',
    label: 'Título',
    placeholder: 'Digite o título...',
    defaultValue: '',
  },
  {
    name: 'user-notes',
    label: 'Notas do usuário',
    placeholder: 'Notas adicionais...',
    defaultValue: '',
  },
  {
    name: 'commentary',
    label: 'Comentário',
    placeholder: 'Ex: Tradição litúrgica...',
    defaultValue: '',
  },
  {
    name: 'width',
    label: 'Largura',
    placeholder: 'Ex: 7.3',
    defaultValue: '7.3',
  },
  {
    name: 'height',
    label: 'Altura',
    placeholder: 'Ex: 11.7',
    defaultValue: '11.7',
  },
  {
    name: 'crop',
    label: 'Corte',
    placeholder: 'Ex: true ou false',
    defaultValue: 'false',
  },
  {
    name: 'font',
    label: 'Fonte',
    placeholder: 'Ex: OFLSortsMillGoudy',
    defaultValue: 'OFLSortsMillGoudy',
  },
  {
    name: 'fontsize',
    label: 'Tamanho da Fonte',
    placeholder: 'Ex: 12',
    defaultValue: '12',
  },
];

function App() {
  const initialHeader = headerFields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue;
    return acc;
  }, {});
  const [header, setHeader] = useState(initialHeader);
  const [dialogue, setDialogue] = useState('regional');
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Valid hook declarations
  const formRef = useRef(null);
  const gabcInputRef = useRef(null);
  const nameRef = useRef(null);
  const userNotesRef = useRef(null);
  const commentaryRef = useRef(null);
  const widthRef = useRef(null);
  const heightRef = useRef(null);
  const cropRef = useRef(null);
  const fontRef = useRef(null);
  const fontsizeRef = useRef(null);

  const refs = {
    name: nameRef,
    'user-notes': userNotesRef,
    commentary: commentaryRef,
    width: widthRef,
    height: heightRef,
    crop: cropRef,
    font: fontRef,
    fontsize: fontsizeRef,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setOutput('');

    try {
      const res = await fetch('https://gabcgen.fly.dev/preface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ header, dialogue, text }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        if (contentType.includes('application/json')) {
          const errData = await res.json();
          setOutput(
            `error code ${errData.error_code}: ${errData.error_message}`
          );
        } else {
          const errText = await res.text();
          setOutput(`Erro ${res.status} - ${res.statusText}: ${errText}`);
        }
        return;
      }

      const data = await res.json();
      setOutput(data.gabc || 'Nenhum conteúdo gabc retornado.');
    } catch (err) {
      console.error(err);
      setOutput('Erro ao conectar ao backend.');
    } finally {
      setLoading(false);
    }
  };

  const genScore = () => {
    if (!output.trim()) {
      alert('GABC vazio. Gere o conteúdo antes.');
      return;
    }

    gabcInputRef.current.value = output;
    headerFields.forEach((field) => {
      if (refs[field.name].current) {
        refs[field.name].current.value = header[field.name];
      }
    });

    formRef.current.submit();
  };

  return (
    <div
      style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}
    >
      <h1>PopeChant Generator</h1>

      <fieldset style={{ padding: '1rem', marginBottom: '1rem' }}>
        <legend>Cabeçalho</legend>
        {headerFields.map((field) => (
          <div key={field.name} style={{ marginBottom: '1rem' }}>
            <label
              htmlFor={field.name}
              style={{ display: 'block', fontWeight: 'bold' }}
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={header[field.name]}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
        ))}
      </fieldset>

      <div style={{ marginBottom: '1rem' }}>
        <label>Tipo de diálogo: </label>
        <select value={dialogue} onChange={(e) => setDialogue(e.target.value)}>
          <option value="regional">Regional</option>
          <option value="roman">Romano</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Prefácio:</label>
        <textarea
          rows={10}
          style={{ width: '100%', padding: '0.75rem' }}
          placeholder="Digite o texto litúrgico aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
      >
        {loading ? 'Enviando...' : 'Gerar GABC'}
      </button>

      <h2 style={{ marginTop: '2rem' }}>Resultado:</h2>
      <textarea
        rows={10}
        style={{
          width: '100%',
          padding: '0.75rem',
          minHeight: '200px',
          whiteSpace: 'pre-wrap',
        }}
        value={output}
        onChange={(e) => setOutput(e.target.value)}
      />

      <button
        onClick={genScore}
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
      >
        Gerar partitura
      </button>

      {/* Hidden form to submit to Source & Summit */}
      <form
        ref={formRef}
        method="post"
        action="https://www.sourceandsummit.com/editor/legacy/process.php"
        target="_blank"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="gabc[]" ref={gabcInputRef} />
        {headerFields.map((field) => (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            ref={refs[field.name]}
          />
        ))}
        <input type="hidden" name="spacing" value="vichi" />
        <input type="hidden" name="fmt" value="pdf" />
      </form>
    </div>
  );
}

export default App;

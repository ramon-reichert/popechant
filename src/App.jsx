import { useState } from 'react';

const headerFields = [
  {
    name: 'name',
    label: 'Título',
    placeholder: 'Ex: Prefácio da Páscoa I',
    defaultValue: '',
  },
  {
    name: 'clef',
    label: 'Clave',
    placeholder: 'c3',
    defaultValue: 'c3',
  },
  {
    name: 'width',
    label: 'Largura (pol.)',
    placeholder: '7.2',
    defaultValue: '7.2',
  },
  {
    name: 'height',
    label: 'Altura (pol.)',
    placeholder: '10.7',
    defaultValue: '10.7',
  },
  {
    name: 'fontsize',
    label: 'Tam. da fonte',
    placeholder: 'Ex: 12',
    defaultValue: '12',
  },
  {
    name: 'croppdf',
    label: 'Cortar margens',
    placeholder: 'Ex: true ou false',
    defaultValue: 'false',
  },
];

function App() {
  const initialHeader = headerFields.reduce((acc, field) => {
    acc[field.name] = field.name === 'croppdf' ? false : field.defaultValue;
    return acc;
  }, {});
  const [header, setHeader] = useState(initialHeader);
  const [dialogue, setDialogue] = useState('solemn');
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const initialStyle = 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setHeader((prev) => ({ ...prev, [name]: fieldValue }));
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
      setOutput('GABC vazio. Gere o conteúdo antes.');
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.sourceandsummit.com/editor/legacy/process.php';
    form.target = '_blank';

    const addHidden = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    // Add GABC field
    addHidden(
      'gabc[]',
      `name: ${header.name};\ninitial-style: ${initialStyle};\n%%\n\n(${header.clef})${output}`
    );

    // Add all header fields
    headerFields.forEach((field) => {
      const valueF =
        field.name === 'croppdf'
          ? header[field.name]
            ? 'true'
            : 'false'
          : header[field.name];
      addHidden(field.name, valueF);
    });

    // Add fixed fields
    addHidden('font', 'OFLSortsMillGoudy');
    addHidden('spacing', 'vichi');
    addHidden('fmt', 'pdf');

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '1rem 2rem',
        fontFamily: "'EB Garamond', serif",
        backgroundColor: '#f8f4dcff',
        color: '#222',
        borderRadius: '6px',
        boxShadow: '0 0 10px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
          PopeChant Generator
        </h1>
        <div style={{ marginBottom: '3rem' }}>
          <label>
            Gerador automático de partituras em estilo gregoriano. Aplica a
            melodia solene do Prefácio da Missa sobre um dado texto.
          </label>
        </div>
        <div
          style={{
            width: '120px',
            height: '2px',
            backgroundColor: '#990000',
            margin: '0 auto',
          }}
        ></div>
      </div>

      <fieldset
        style={{
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <legend>Opções do documento</legend>

        {headerFields.map((field) => {
          const isTitle = field.name === 'name';
          const isCheckbox = field.name === 'croppdf';

          return (
            <div
              key={field.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: isTitle ? '300px' : '60px',
                flex: isTitle ? '1 1 100%' : '0 0 auto',
              }}
            >
              <label htmlFor={field.name} style={{ whiteSpace: 'nowrap' }}>
                {field.label}
              </label>

              {field.name === 'clef' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={header[field.name]}
                  onChange={handleChange}
                  style={{ padding: '0.5rem', width: '60px' }}
                >
                  {['c1', 'c2', 'c3', 'c4', 'f1', 'f2', 'f3', 'f4'].map(
                    (opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    )
                  )}
                </select>
              ) : isCheckbox ? (
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={header[field.name] === true}
                  onChange={(e) =>
                    setHeader((prev) => ({
                      ...prev,
                      [field.name]: e.target.checked,
                    }))
                  }
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={header[field.name]}
                  onChange={handleChange}
                  style={{
                    padding: '0.4rem 0.5rem',
                    fontFamily: "'EB Garamond', serif",
                    fontSize: '1rem',
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    width: isTitle ? '100%' : '30px',
                  }}
                />
              )}
            </div>
          );
        })}
      </fieldset>

      <div style={{ marginBottom: '1rem' }}>
        <label>Tipo de diálogo: </label>
        <select value={dialogue} onChange={(e) => setDialogue(e.target.value)}>
          <option value="regional">Regional</option>
          <option value="solemn">Solene</option>
        </select>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <legend>Digite o texto dividido em linhas:</legend>
        <textarea
          rows={15}
          style={{
            width: 'calc(100% - 1rem)',
            padding: '0.4rem 0.5rem',
            fontFamily: "'EB Garamond', serif",
            fontSize: '1rem',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
          placeholder={`Ex: 
Na verdade, é digno e justo, //cadência "inicial"
é nosso dever e salvação proclamar vossa glória, ó Pai, em todo tempo, //cadência "inicial"
mas, com maior júbilo, louvar-vos nesta noite, ( neste dia ou neste tempo ) //cadência mediana + (diretiva ou "rúbrica")
porque Cristo, nossa Páscoa, foi imolado. //cadência final

É ele o verdadeiro Cordeiro, que tirou o pecado do mundo; //cadência "inicial"
morrendo, destruiu a nossa morte //cadência mediana
e, ressurgindo, restaurou a vida. //cadência final

Por isso, //exceção de início do parágrafo conclusivo
transbordando de alegria pascal, exulta a criação por toda a terra; //cadência "inicial"
também as Virtudes celestes e as Potestades angélicas proclamam um hino à vossa glória, //cadência "inicial"
cantando //cadência mediana
a uma só voz: //cadência final`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          marginBottom: '2rem',
        }}
      >
        {loading ? 'Enviando...' : 'Gerar GABC'}
      </button>

      <div style={{ marginBottom: '0.5rem' }}>
        <legend>
          Modifique o resultado conforme a necessidade e então clique para gerar
          a partitura em PDF:
        </legend>

        <textarea
          rows={15}
          style={{
            width: 'calc(100% - 1rem)',
            minHeight: '200px',
            whiteSpace: 'pre-wrap',
            padding: '0.4rem 0.5rem',
            fontFamily: "'EB Garamond', serif",
            fontSize: '1rem',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
        />
      </div>

      <button
        onClick={genScore}
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
      >
        Gerar partitura
      </button>
    </div>
  );
}

export default App;

import { useState, useRef } from 'react';

const headerFields = [
  {
    name: 'name',
    label: 'Título',
    placeholder: 'Ex: Prefácio da Páscoa I',
    defaultValue: '',
  } /*
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
  },*/,
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
    defaultValue: `false`,
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
  const initialStyle = 0;

  const formRef = useRef(null);
  const gabcInputRef = useRef(null);
  const nameRef = useRef(null);
  // const userNotesRef = useRef(null);
  // const commentaryRef = useRef(null);
  const clefRef = useRef(null);
  const widthRef = useRef(null);
  const heightRef = useRef(null);
  const cropRef = useRef(null);
  //  const fontRef = useRef(null);
  const fontsizeRef = useRef(null);

  const refs = {
    name: nameRef,
    //  'user-notes': userNotesRef,
    //  commentary: commentaryRef,
    clef: clefRef,
    width: widthRef,
    height: heightRef,
    croppdf: cropRef,
    //   font: fontRef,
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

    gabcInputRef.current.value =
      'initial-style: ' +
      initialStyle +
      ';\n%%\n\n' +
      '(' +
      clefRef.current.value +
      ')' +
      output;

    headerFields.forEach((field) => {
      if (refs[field.name].current) {
        refs[field.name].current.value = header[field.name];
      }
    });
    formRef.current.submit();
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '2rem auto',
        padding: '1rem',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        PopeChant Generator
      </h1>

      <div style={{ marginBottom: '3rem' }}>
        <label>
          Gerador automático de partituras em estilo gregoriano. Aplica a
          melodia solene do Prefácio da Missa sobre um dado texto.
        </label>
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
              <label
                htmlFor={field.name}
                style={{
                  // fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  minWidth: '20px',
                }}
              >
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
                  checked={header[field.name] === '`true`'}
                  onChange={(e) =>
                    setHeader((prev) => ({
                      ...prev,
                      [field.name]: e.target.checked ? '`true`' : '`false`',
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
                    padding: '0.5rem',
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
          <option value="roman">Romano</option>
        </select>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <label>Digite o texto divido em linhas:</label>
        <textarea
          rows={15}
          style={{ width: '100%', padding: '1rem' }}
          placeholder='Ex: 
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
a uma só voz: //cadência final'
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
        <label>
          Modifique o resultado conforme a necessidade e então clique para gerar
          a partitura em PDF:
        </label>

        <textarea
          rows={10}
          style={{
            width: '100%',
            padding: '1rem',
            minHeight: '200px',
            whiteSpace: 'pre-wrap',
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
        <input type="hidden" name="font" value="OFLSortsMillGoudy" />
        <input type="hidden" name="spacing" value="vichi" />
        <input type="hidden" name="fmt" value="pdf" />
      </form>
    </div>
  );
}

export default App;

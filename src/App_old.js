import React, { useState, useMemo } from 'react';

export default function App() {
  const [ral, setRal] = useState(28000);
  const [livello, setLivello] = useState('4');
  const [tipoContratto, setTipoContratto] = useState('indeterminato');
  const [orario, setOrario] = useState('full-time');
  const [percentualePartTime, setPercentualePartTime] = useState(50);
  const [regione, setRegione] = useState('nord');
  const [anzianita, setAnzianita] = useState(0);

  const livelliCCNL = {
    'Q': { descrizione: 'Quadro', minimoTabellare: 2075.19 },
    '1': { descrizione: 'Primo livello', minimoTabellare: 1870.44 },
    '2': { descrizione: 'Secondo livello', minimoTabellare: 1618.75 },
    '3': { descrizione: 'Terzo livello', minimoTabellare: 1383.80 },
    '4': { descrizione: 'Quarto livello', minimoTabellare: 1196.64 },
    '5': { descrizione: 'Quinto livello', minimoTabellare: 1081.67 },
    '6': { descrizione: 'Sesto livello', minimoTabellare: 971.27 },
    '7': { descrizione: 'Settimo livello', minimoTabellare: 833.30 },
  };

  const aliquoteINAIL = {
    'nord': 0.0040,
    'centro': 0.0045,
    'sud': 0.0050,
  };

  const calcoli = useMemo(() => {
    const fattoreOrario = orario === 'part-time' ? percentualePartTime / 100 : 1;
    const ralEffettiva = ral * fattoreOrario;
    
    // =====================
    // COSTO AZIENDA
    // =====================
    
    // Contributi INPS a carico azienda (circa 29-31%)
    const aliquotaINPS = 0.2981; // Aliquota media commercio
    const contributiINPS = ralEffettiva * aliquotaINPS;
    
    // INAIL
    const aliquotaINAIL = aliquoteINAIL[regione];
    const contributiINAIL = ralEffettiva * aliquotaINAIL;
    
    // TFR (circa 6.91% della retribuzione annua)
    const tfr = ralEffettiva * 0.0691;
    
    // 13esima e 14esima (già incluse nella RAL, ma calcoliamo i contributi aggiuntivi)
    const mensilitaAggiuntive = ralEffettiva / 12 * 2;
    const contributiMensilitaAggiuntive = mensilitaAggiuntive * aliquotaINPS;
    
    // Fondo Est (assistenza sanitaria integrativa) - circa €144/anno per full-time
    const fondoEst = 144 * fattoreOrario;
    
    // Fondo Quas per quadri
    const fondoQuas = livello === 'Q' ? 350 * fattoreOrario : 0;
    
    // Costo formazione obbligatoria (stima)
    const costoFormazione = 200 * fattoreOrario;
    
    // Maggiorazione anzianità (scatti)
    const scattiAnzianita = Math.min(Math.floor(anzianita / 3), 10);
    const importoScatto = livello === 'Q' ? 26.96 : 
                          livello === '1' ? 25.05 :
                          livello === '2' ? 21.95 :
                          livello === '3' ? 19.35 :
                          livello === '4' ? 17.77 :
                          livello === '5' ? 16.43 :
                          livello === '6' ? 15.35 : 13.78;
    const costoScatti = scattiAnzianita * importoScatto * 14 * fattoreOrario;
    const contributiScatti = costoScatti * aliquotaINPS;
    
    // Costo totale annuo
    const costoTotaleAnnuo = ralEffettiva + 
                             contributiINPS + 
                             contributiINAIL + 
                             tfr + 
                             fondoEst + 
                             fondoQuas + 
                             costoFormazione +
                             costoScatti +
                             contributiScatti;
    
    // Costo mensile
    const costoMensile = costoTotaleAnnuo / 12;
    
    // Costo orario (considerando 1720 ore lavorative annue per full-time)
    const oreLavorativeAnnue = 1720 * fattoreOrario;
    const costoOrario = costoTotaleAnnuo / oreLavorativeAnnue;
    
    // Percentuale di maggiorazione rispetto alla RAL
    const maggiorazionePercentuale = ((costoTotaleAnnuo - ralEffettiva) / ralEffettiva) * 100;

    // =====================
    // NETTO DIPENDENTE
    // =====================
    
    // Contributi INPS a carico dipendente (9.19%)
    const contributiINPSDipendente = ralEffettiva * 0.0919;
    
    // Imponibile fiscale
    const imponibileFiscale = ralEffettiva - contributiINPSDipendente;
    
    // Calcolo IRPEF 2024 con scaglioni
    const calcolaIRPEF = (imponibile) => {
      let irpef = 0;
      if (imponibile <= 28000) {
        irpef = imponibile * 0.23;
      } else if (imponibile <= 50000) {
        irpef = 28000 * 0.23 + (imponibile - 28000) * 0.35;
      } else {
        irpef = 28000 * 0.23 + 22000 * 0.35 + (imponibile - 50000) * 0.43;
      }
      return irpef;
    };
    
    const irpefLorda = calcolaIRPEF(imponibileFiscale);
    
    // Detrazioni lavoro dipendente 2024
    const calcolaDetrazioniLavoro = (reddito) => {
      if (reddito <= 15000) {
        return 1955;
      } else if (reddito <= 28000) {
        return 1910 + 1190 * ((28000 - reddito) / 13000);
      } else if (reddito <= 50000) {
        return 1910 * ((50000 - reddito) / 22000);
      } else {
        return 0;
      }
    };
    
    const detrazioniLavoro = calcolaDetrazioniLavoro(imponibileFiscale);
    
    // Trattamento integrativo (ex bonus Renzi) - fino a 15.000€, parziale fino a 28.000€
    let trattamentoIntegrativo = 0;
    if (imponibileFiscale <= 15000) {
      trattamentoIntegrativo = 1200;
    } else if (imponibileFiscale <= 28000) {
      // Spetta se le detrazioni sono superiori all'IRPEF lorda
      const detrazioniTotali = detrazioniLavoro;
      if (detrazioniTotali > irpefLorda) {
        trattamentoIntegrativo = Math.min(1200, detrazioniTotali - irpefLorda);
      }
    }
    
    // IRPEF netta
    const irpefNetta = Math.max(0, irpefLorda - detrazioniLavoro);
    
    // Addizionale regionale (stima media 1.5%)
    const addizionaleRegionaleAliquote = {
      'nord': 0.0143,
      'centro': 0.0173,
      'sud': 0.0163,
    };
    const addizionaleRegionale = imponibileFiscale * addizionaleRegionaleAliquote[regione];
    
    // Addizionale comunale (stima media 0.8%)
    const addizionaleComunale = imponibileFiscale * 0.008;
    
    // Totale trattenute
    const totaleTrattenute = contributiINPSDipendente + irpefNetta + addizionaleRegionale + addizionaleComunale;
    
    // Netto annuo
    const nettoAnnuo = ralEffettiva - totaleTrattenute + trattamentoIntegrativo;
    
    // Netto mensile (su 12 mesi, considerando 13a e 14a distribuite)
    const nettoMensile = nettoAnnuo / 12;
    
    // Netto mensile ordinario (su 14 mensilità)
    const nettoMensileOrdinario = nettoAnnuo / 14;
    
    // Percentuale netto su lordo
    const percentualeNetto = (nettoAnnuo / ralEffettiva) * 100;

    return {
      ralEffettiva,
      contributiINPS,
      contributiINAIL,
      tfr,
      fondoEst,
      fondoQuas,
      costoFormazione,
      costoScatti,
      contributiScatti,
      costoTotaleAnnuo,
      costoMensile,
      costoOrario,
      maggiorazionePercentuale,
      scattiAnzianita,
      // Nuovi campi netto
      contributiINPSDipendente,
      imponibileFiscale,
      irpefLorda,
      detrazioniLavoro,
      irpefNetta,
      addizionaleRegionale,
      addizionaleComunale,
      trattamentoIntegrativo,
      totaleTrattenute,
      nettoAnnuo,
      nettoMensile,
      nettoMensileOrdinario,
      percentualeNetto,
    };
  }, [ral, livello, orario, percentualePartTime, regione, anzianita]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ 
          color: 'white', 
          textAlign: 'center', 
          marginBottom: '8px',
          fontSize: '28px',
          fontWeight: '600'
        }}>
          💼 Simulatore Costo Dipendente
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.8)', 
          textAlign: 'center', 
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          CCNL Commercio e Terziario
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Pannello parametri */}
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚙️ Parametri
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* RAL */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  RAL (Retribuzione Annua Lorda)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={ral}
                    onChange={(e) => setRal(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingLeft: '32px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e3a5f',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <span style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>€</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="100000"
                  step="500"
                  value={ral}
                  onChange={(e) => setRal(Number(e.target.value))}
                  style={{ width: '100%', marginTop: '8px', accentColor: '#3b82f6' }}
                />
              </div>

              {/* Livello */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  Livello contrattuale
                </label>
                <select
                  value={livello}
                  onChange={(e) => setLivello(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#1e3a5f',
                    outline: 'none',
                    cursor: 'pointer',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  {Object.entries(livelliCCNL).map(([key, value]) => (
                    <option key={key} value={key}>
                      {key === 'Q' ? 'Quadro' : `Livello ${key}`} - {value.descrizione}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo contratto */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  Tipo contratto
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['indeterminato', 'determinato'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setTipoContratto(tipo)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: tipoContratto === tipo ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                        borderRadius: '10px',
                        background: tipoContratto === tipo ? '#eff6ff' : 'white',
                        color: tipoContratto === tipo ? '#3b82f6' : '#64748b',
                        fontWeight: '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orario */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  Orario di lavoro
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['full-time', 'part-time'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setOrario(tipo)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: orario === tipo ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                        borderRadius: '10px',
                        background: orario === tipo ? '#eff6ff' : 'white',
                        color: orario === tipo ? '#3b82f6' : '#64748b',
                        fontWeight: '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tipo === 'full-time' ? 'Full-time' : 'Part-time'}
                    </button>
                  ))}
                </div>
                {orario === 'part-time' && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Percentuale orario</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>{percentualePartTime}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      step="5"
                      value={percentualePartTime}
                      onChange={(e) => setPercentualePartTime(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#3b82f6' }}
                    />
                  </div>
                )}
              </div>

              {/* Regione */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  Area geografica
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 'nord', label: 'Nord' },
                    { value: 'centro', label: 'Centro' },
                    { value: 'sud', label: 'Sud' }
                  ].map((area) => (
                    <button
                      key={area.value}
                      onClick={() => setRegione(area.value)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: regione === area.value ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                        borderRadius: '10px',
                        background: regione === area.value ? '#eff6ff' : 'white',
                        color: regione === area.value ? '#3b82f6' : '#64748b',
                        fontWeight: '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anzianità */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  Anzianità aziendale: {anzianita} {anzianita === 1 ? 'anno' : 'anni'}
                  {calcoli.scattiAnzianita > 0 && (
                    <span style={{ color: '#22c55e', marginLeft: '8px' }}>
                      ({calcoli.scattiAnzianita} {calcoli.scattiAnzianita === 1 ? 'scatto' : 'scatti'})
                    </span>
                  )}
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={anzianita}
                  onChange={(e) => setAnzianita(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>
            </div>
          </div>

          {/* Pannello risultati */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Card costo totale */}
            <div style={{ 
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              color: 'white'
            }}>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                Costo totale annuo azienda
              </p>
              <p style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>
                {formatCurrency(calcoli.costoTotaleAnnuo)}
              </p>
              <div style={{ 
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '13px'
              }}>
                +{calcoli.maggiorazionePercentuale.toFixed(1)}% rispetto alla RAL
              </div>
            </div>

            {/* Card netto dipendente */}
            <div style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              color: 'white'
            }}>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                Netto annuo in busta
              </p>
              <p style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>
                {formatCurrency(calcoli.nettoAnnuo)}
              </p>
              <div style={{ 
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '13px'
              }}>
                {calcoli.percentualeNetto.toFixed(1)}% della RAL
              </div>
            </div>

            {/* Cards costo mensile e orario */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ 
                background: 'white',
                borderRadius: '12px', 
                padding: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Costo mensile azienda
                </p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#22c55e' }}>
                  {formatCurrency(calcoli.costoMensile)}
                </p>
              </div>
              <div style={{ 
                background: 'white',
                borderRadius: '12px', 
                padding: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Netto mensile (÷12)
                </p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#3b82f6' }}>
                  {formatCurrency(calcoli.nettoMensile)}
                </p>
              </div>
              <div style={{ 
                background: 'white',
                borderRadius: '12px', 
                padding: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Costo orario
                </p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a5f' }}>
                  {formatCurrency(calcoli.costoOrario)}
                </p>
              </div>
              <div style={{ 
                background: 'white',
                borderRadius: '12px', 
                padding: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Netto mensile (÷14)
                </p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#3b82f6' }}>
                  {formatCurrency(calcoli.nettoMensileOrdinario)}
                </p>
              </div>
            </div>

            {/* Dettaglio voci */}
            <div style={{ 
              background: 'white',
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#22c55e'
              }}>
                🏢 Dettaglio costo azienda
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <CostRow label="RAL effettiva" value={calcoli.ralEffettiva} formatCurrency={formatCurrency} />
                <CostRow label="Contributi INPS (29.81%)" value={calcoli.contributiINPS} formatCurrency={formatCurrency} />
                <CostRow label="Contributi INAIL" value={calcoli.contributiINAIL} formatCurrency={formatCurrency} />
                <CostRow label="TFR (6.91%)" value={calcoli.tfr} formatCurrency={formatCurrency} />
                <CostRow label="Fondo Est (sanità integrativa)" value={calcoli.fondoEst} formatCurrency={formatCurrency} />
                {calcoli.fondoQuas > 0 && (
                  <CostRow label="Fondo Quas (quadri)" value={calcoli.fondoQuas} formatCurrency={formatCurrency} />
                )}
                <CostRow label="Formazione obbligatoria" value={calcoli.costoFormazione} formatCurrency={formatCurrency} />
                {calcoli.costoScatti > 0 && (
                  <>
                    <CostRow label="Scatti anzianità" value={calcoli.costoScatti} formatCurrency={formatCurrency} />
                    <CostRow label="Contributi su scatti" value={calcoli.contributiScatti} formatCurrency={formatCurrency} />
                  </>
                )}
              </div>

              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '2px dashed #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '600', color: '#1e3a5f' }}>TOTALE COSTO AZIENDA</span>
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#22c55e' }}>
                  {formatCurrency(calcoli.costoTotaleAnnuo)}
                </span>
              </div>
            </div>

            {/* Dettaglio trattenute dipendente */}
            <div style={{ 
              background: 'white',
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#3b82f6'
              }}>
                👤 Dettaglio busta paga dipendente
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <CostRow label="RAL (lordo annuo)" value={calcoli.ralEffettiva} formatCurrency={formatCurrency} color="#1e3a5f" />
                <CostRow label="− Contributi INPS dipendente (9.19%)" value={-calcoli.contributiINPSDipendente} formatCurrency={formatCurrency} color="#ef4444" negative />
                <div style={{ 
                  padding: '8px 12px',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '500' }}>= Imponibile fiscale</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                    {formatCurrency(calcoli.imponibileFiscale)}
                  </span>
                </div>
                <CostRow label="− IRPEF lorda" value={-calcoli.irpefLorda} formatCurrency={formatCurrency} color="#ef4444" negative />
                <CostRow label="+ Detrazioni lavoro dipendente" value={calcoli.detrazioniLavoro} formatCurrency={formatCurrency} color="#22c55e" />
                <div style={{ 
                  padding: '8px 12px',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '500' }}>= IRPEF netta</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
                    {formatCurrency(calcoli.irpefNetta)}
                  </span>
                </div>
                <CostRow label="− Addizionale regionale" value={-calcoli.addizionaleRegionale} formatCurrency={formatCurrency} color="#ef4444" negative />
                <CostRow label="− Addizionale comunale" value={-calcoli.addizionaleComunale} formatCurrency={formatCurrency} color="#ef4444" negative />
                {calcoli.trattamentoIntegrativo > 0 && (
                  <CostRow label="+ Trattamento integrativo (ex bonus)" value={calcoli.trattamentoIntegrativo} formatCurrency={formatCurrency} color="#22c55e" />
                )}
              </div>

              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '2px dashed #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '600', color: '#1e3a5f' }}>NETTO ANNUO</span>
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#3b82f6' }}>
                  {formatCurrency(calcoli.nettoAnnuo)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '12px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '12px'
        }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>⚠️ Nota:</strong> Questa simulazione fornisce una stima indicativa basata su parametri standard del CCNL Commercio.
          </p>
          <p>
            Il costo effettivo può variare in base a: sgravi contributivi applicabili, welfare aziendale, straordinari, 
            premi e bonus, buoni pasto, e altre voci specifiche. Per un calcolo preciso si consiglia di consultare un consulente del lavoro.
          </p>
        </div>
      </div>
    </div>
  );
}

function CostRow({ label, value, formatCurrency, color = '#1e3a5f', negative = false }) {
  const displayValue = negative ? value : value;
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '8px 12px',
      background: '#f8fafc',
      borderRadius: '8px'
    }}>
      <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: '600', color: value < 0 ? '#ef4444' : color }}>
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

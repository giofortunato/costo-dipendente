import React, { useState, useMemo } from 'react';

export default function App() {
  const [ral, setRal] = useState(28000);
  const [livello, setLivello] = useState('4');
  const [tipoContratto, setTipoContratto] = useState('indeterminato');
  const [orario, setOrario] = useState('full-time');
  const [percentualePartTime, setPercentualePartTime] = useState(50);
  const [regione, setRegione] = useState('nord');
  const [anzianita, setAnzianita] = useState(0);
  const [coniugeCarico, setConiugeCarico] = useState(false);
  const [numFigli, setNumFigli] = useState(0);
  const [figliUnder24, setFigliUnder24] = useState(0);
  const [altriFamiliari, setAltriFamiliari] = useState(0);
  const [buoniPasto, setBuoniPasto] = useState(0);
  const [giorniBuoniPasto, setGiorniBuoniPasto] = useState(220);
  const [buoniPastoElettronici, setBuoniPastoElettronici] = useState(true);
  const [autoAziendale, setAutoAziendale] = useState(false);
  const [fringeBenefitAuto, setFringeBenefitAuto] = useState(3000);
  const [welfare, setWelfare] = useState(0);
  const [premioRisultato, setPremioRisultato] = useState(0);
  const [oreStraordinario, setOreStraordinario] = useState(0);
  const [sgravioGiovani, setSgravioGiovani] = useState(false);
  const [sgravioDonne, setSgravioDonne] = useState(false);
  const [decontribuzioneSud, setDecontribuzioneSud] = useState(false);
  const [apprendistato, setApprendistato] = useState(false);
  const [assicurazioneIntegrativa, setAssicurazioneIntegrativa] = useState(0);
  const [previdenzaComplementare, setPrevidenzaComplementare] = useState(0);
  const [contributoAziendaPrevCompl, setContributoAziendaPrevCompl] = useState(0);
  const [costiSelezione, setCostiSelezione] = useState(0);
  const [activeTab, setActiveTab] = useState('base');

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

  const aliquoteINAIL = { 'nord': 0.0040, 'centro': 0.0045, 'sud': 0.0050 };

  const calcoli = useMemo(() => {
    const fattoreOrario = orario === 'part-time' ? percentualePartTime / 100 : 1;
    const ralEffettiva = ral * fattoreOrario;
    const retribuzioneOraria = ralEffettiva / 1720;
    const costoStraordinariLordo = oreStraordinario * retribuzioneOraria * 1.25;
    const sogliaEsenzione = buoniPastoElettronici ? 8 : 4;
    const buoniPastoImponibili = Math.max(0, buoniPasto - sogliaEsenzione) * giorniBuoniPasto;
    const buoniPastoEsenti = Math.min(buoniPasto, sogliaEsenzione) * giorniBuoniPasto;
    const costoBuoniPastoAzienda = buoniPasto * giorniBuoniPasto;
    const fringeBenefitAutoImponibile = autoAziendale ? fringeBenefitAuto : 0;
    const sogliaWelfare = numFigli > 0 ? 3000 : 2000;
    const welfareEsente = Math.min(welfare, sogliaWelfare);
    const welfareImponibile = Math.max(0, welfare - sogliaWelfare);
    const premioTassazioneAgevolata = ralEffettiva < 80000 ? Math.min(premioRisultato, 3000) : 0;
    const imponibilePrevidenziale = ralEffettiva + costoStraordinariLordo + buoniPastoImponibili + fringeBenefitAutoImponibile + welfareImponibile + premioRisultato;
    
    let aliquotaINPSAzienda = 0.2981;
    let descrizioneEsonero = '';
    if (apprendistato) { aliquotaINPSAzienda = 0.1161; descrizioneEsonero = 'Apprendistato'; }
    else if (sgravioGiovani) { aliquotaINPSAzienda = 0.2981 * 0.4; descrizioneEsonero = 'Esonero giovani under 36 (60%)'; }
    else if (sgravioDonne) { aliquotaINPSAzienda = 0.2981 * 0.4; descrizioneEsonero = 'Esonero donne svantaggiate (60%)'; }
    let fattoreDecontribuzioneSud = 1;
    if (decontribuzioneSud && regione === 'sud') { fattoreDecontribuzioneSud = 0.7; descrizioneEsonero += (descrizioneEsonero ? ' + ' : '') + 'Decontribuzione Sud (30%)'; }
    const aliquotaINPSEffettiva = aliquotaINPSAzienda * fattoreDecontribuzioneSud;
    const contributiINPS = imponibilePrevidenziale * aliquotaINPSEffettiva;
    const risparmioContributi = imponibilePrevidenziale * 0.2981 - contributiINPS;
    const contributiINAIL = imponibilePrevidenziale * aliquoteINAIL[regione];
    const tfr = imponibilePrevidenziale * 0.0691;
    const fondoEst = 144 * fattoreOrario;
    const fondoQuas = livello === 'Q' ? 350 * fattoreOrario : 0;
    const costoFormazione = 200 * fattoreOrario;
    const scattiAnzianita = Math.min(Math.floor(anzianita / 3), 10);
    const importoScatto = livello === 'Q' ? 26.96 : livello === '1' ? 25.05 : livello === '2' ? 21.95 : livello === '3' ? 19.35 : livello === '4' ? 17.77 : livello === '5' ? 16.43 : livello === '6' ? 15.35 : 13.78;
    const costoScatti = scattiAnzianita * importoScatto * 14 * fattoreOrario;
    const contributiScatti = costoScatti * aliquotaINPSEffettiva;
    
    const costoTotaleAnnuo = ralEffettiva + costoStraordinariLordo + contributiINPS + contributiINAIL + tfr + fondoEst + fondoQuas + costoFormazione + costoScatti + contributiScatti + costoBuoniPastoAzienda + welfareEsente + welfareImponibile + premioRisultato + assicurazioneIntegrativa + contributoAziendaPrevCompl + costiSelezione + (autoAziendale ? fringeBenefitAuto * 0.3 : 0);
    const costoMensile = costoTotaleAnnuo / 12;
    const costoOrario = costoTotaleAnnuo / (1720 * fattoreOrario);
    const maggiorazionePercentuale = ((costoTotaleAnnuo - ralEffettiva) / ralEffettiva) * 100;

    const contributiINPSDipendente = imponibilePrevidenziale * 0.0919;
    const imponibileFiscale = imponibilePrevidenziale - contributiINPSDipendente - previdenzaComplementare;
    const calcolaIRPEF = (imp) => imp <= 28000 ? imp * 0.23 : imp <= 50000 ? 28000 * 0.23 + (imp - 28000) * 0.35 : 28000 * 0.23 + 22000 * 0.35 + (imp - 50000) * 0.43;
    const irpefLorda = calcolaIRPEF(imponibileFiscale);
    const detrazioniLavoro = imponibileFiscale <= 15000 ? 1955 : imponibileFiscale <= 28000 ? 1910 + 1190 * ((28000 - imponibileFiscale) / 13000) : imponibileFiscale <= 50000 ? 1910 * ((50000 - imponibileFiscale) / 22000) : 0;
    let detrazioniConiuge = 0;
    if (coniugeCarico) { detrazioniConiuge = imponibileFiscale <= 15000 ? 800 - 110 * (imponibileFiscale / 15000) : imponibileFiscale <= 40000 ? 690 : imponibileFiscale <= 80000 ? 690 * ((80000 - imponibileFiscale) / 40000) : 0; }
    const figliOver21 = Math.max(0, numFigli - figliUnder24);
    const detrazioniFigli = figliOver21 > 0 && imponibileFiscale < 95000 ? 950 * figliOver21 * ((95000 - imponibileFiscale) / 95000) : 0;
    const detrazioniAltri = altriFamiliari > 0 && imponibileFiscale < 80000 ? 750 * altriFamiliari * ((80000 - imponibileFiscale) / 80000) : 0;
    const detrazioniTotali = detrazioniLavoro + detrazioniConiuge + detrazioniFigli + detrazioniAltri;
    let trattamentoIntegrativo = 0;
    if (imponibileFiscale <= 15000) trattamentoIntegrativo = 1200;
    else if (imponibileFiscale <= 28000 && detrazioniTotali > irpefLorda) trattamentoIntegrativo = Math.min(1200, detrazioniTotali - irpefLorda);
    const irpefNetta = Math.max(0, irpefLorda - detrazioniTotali);
    const impostaPremio = premioTassazioneAgevolata * 0.05;
    const addizionaleRegionale = imponibileFiscale * ({ 'nord': 0.0143, 'centro': 0.0173, 'sud': 0.0163 }[regione]);
    const addizionaleComunale = imponibileFiscale * 0.008;
    const totaleTrattenute = contributiINPSDipendente + previdenzaComplementare + irpefNetta + impostaPremio + addizionaleRegionale + addizionaleComunale;
    const nettoAnnuo = imponibilePrevidenziale - totaleTrattenute + trattamentoIntegrativo + buoniPastoEsenti + welfareEsente;
    const nettoMensile = nettoAnnuo / 12;
    const nettoMensileOrdinario = nettoAnnuo / 14;
    const percentualeNetto = (nettoAnnuo / ralEffettiva) * 100;

    return { ralEffettiva, imponibilePrevidenziale, contributiINPS, aliquotaINPSEffettiva, contributiINAIL, tfr, fondoEst, fondoQuas, costoFormazione, costoScatti, contributiScatti, scattiAnzianita, costoStraordinariLordo, costoBuoniPastoAzienda, welfareEsente, welfareImponibile, premioRisultato, costoTotaleAnnuo, costoMensile, costoOrario, maggiorazionePercentuale, risparmioContributi, descrizioneEsonero, contributiINPSDipendente, imponibileFiscale, irpefLorda, detrazioniLavoro, detrazioniConiuge, detrazioniFigli, detrazioniAltri, detrazioniTotali, irpefNetta, impostaPremio, addizionaleRegionale, addizionaleComunale, trattamentoIntegrativo, buoniPastoEsenti, nettoAnnuo, nettoMensile, nettoMensileOrdinario, percentualeNetto, assicurazioneIntegrativa, contributoAziendaPrevCompl, costiSelezione, previdenzaComplementare };
  }, [ral, livello, orario, percentualePartTime, regione, anzianita, coniugeCarico, numFigli, figliUnder24, altriFamiliari, buoniPasto, giorniBuoniPasto, buoniPastoElettronici, autoAziendale, fringeBenefitAuto, welfare, premioRisultato, oreStraordinario, sgravioGiovani, sgravioDonne, decontribuzioneSud, apprendistato, assicurazioneIntegrativa, previdenzaComplementare, contributoAziendaPrevCompl, costiSelezione]);

  const formatCurrency = (v) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);
  const TabButton = ({ id, label, icon }) => (<button onClick={() => setActiveTab(id)} style={{ padding: '10px 16px', border: 'none', background: activeTab === id ? '#3b82f6' : 'transparent', color: activeTab === id ? 'white' : '#64748b', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>{icon} {label}</button>);
  const InputField = ({ label, value, onChange, min, max, step, suffix, prefix }) => (<div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>{label}</label><div style={{ position: 'relative' }}>{prefix && <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>{prefix}</span>}<input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} style={{ width: '100%', padding: '10px 12px', paddingLeft: prefix ? '28px' : '12px', paddingRight: suffix ? '40px' : '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e3a5f', outline: 'none', boxSizing: 'border-box' }} />{suffix && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }}>{suffix}</span>}</div></div>);
  const Toggle = ({ label, checked, onChange, description }) => (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}><div><span style={{ fontSize: '13px', color: '#1e3a5f', fontWeight: '500' }}>{label}</span>{description && <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{description}</p>}</div><button onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: checked ? '#22c55e' : '#e2e8f0', cursor: 'pointer', position: 'relative' }}><span style={{ position: 'absolute', top: '2px', left: checked ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} /></button></div>);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '4px', fontSize: '26px', fontWeight: '600' }}>💼 Simulatore Costo Dipendente</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '24px', fontSize: '13px' }}>CCNL Commercio e Terziario - Calcolo avanzato</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              <TabButton id="base" label="Base" icon="📋" />
              <TabButton id="famiglia" label="Famiglia" icon="👨‍👩‍👧" />
              <TabButton id="benefit" label="Benefit" icon="🎁" />
              <TabButton id="sgravi" label="Sgravi" icon="💰" />
              <TabButton id="altro" label="Altro" icon="📦" />
            </div>
            <div style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
              {activeTab === 'base' && (<>
                <InputField label="RAL (Retribuzione Annua Lorda)" value={ral} onChange={setRal} prefix="€" min={15000} max={150000} step={500} />
                <input type="range" min="15000" max="100000" step="500" value={ral} onChange={(e) => setRal(Number(e.target.value))} style={{ width: '100%', marginBottom: '16px', accentColor: '#3b82f6' }} />
                <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Livello contrattuale</label><select value={livello} onChange={(e) => setLivello(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e3a5f', boxSizing: 'border-box' }}>{Object.entries(livelliCCNL).map(([k, v]) => <option key={k} value={k}>{k === 'Q' ? 'Quadro' : `Livello ${k}`} - {v.descrizione}</option>)}</select></div>
                <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Tipo contratto</label><div style={{ display: 'flex', gap: '8px' }}>{['indeterminato', 'determinato'].map((t) => <button key={t} onClick={() => setTipoContratto(t)} style={{ flex: 1, padding: '8px', border: tipoContratto === t ? '2px solid #3b82f6' : '2px solid #e2e8f0', borderRadius: '8px', background: tipoContratto === t ? '#eff6ff' : 'white', color: tipoContratto === t ? '#3b82f6' : '#64748b', fontWeight: '500', fontSize: '12px', cursor: 'pointer' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div></div>
                <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Orario di lavoro</label><div style={{ display: 'flex', gap: '8px' }}>{['full-time', 'part-time'].map((t) => <button key={t} onClick={() => setOrario(t)} style={{ flex: 1, padding: '8px', border: orario === t ? '2px solid #3b82f6' : '2px solid #e2e8f0', borderRadius: '8px', background: orario === t ? '#eff6ff' : 'white', color: orario === t ? '#3b82f6' : '#64748b', fontWeight: '500', fontSize: '12px', cursor: 'pointer' }}>{t === 'full-time' ? 'Full-time' : 'Part-time'}</button>)}</div>{orario === 'part-time' && <div style={{ marginTop: '8px' }}><input type="range" min="20" max="90" step="5" value={percentualePartTime} onChange={(e) => setPercentualePartTime(Number(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6' }} /><span style={{ fontSize: '12px', color: '#3b82f6' }}>{percentualePartTime}%</span></div>}</div>
                <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Area geografica</label><div style={{ display: 'flex', gap: '8px' }}>{[{ value: 'nord', label: 'Nord' }, { value: 'centro', label: 'Centro' }, { value: 'sud', label: 'Sud' }].map((a) => <button key={a.value} onClick={() => setRegione(a.value)} style={{ flex: 1, padding: '8px', border: regione === a.value ? '2px solid #3b82f6' : '2px solid #e2e8f0', borderRadius: '8px', background: regione === a.value ? '#eff6ff' : 'white', color: regione === a.value ? '#3b82f6' : '#64748b', fontWeight: '500', fontSize: '12px', cursor: 'pointer' }}>{a.label}</button>)}</div></div>
                <InputField label={`Anzianità aziendale: ${anzianita} anni (${calcoli.scattiAnzianita} scatti)`} value={anzianita} onChange={setAnzianita} min={0} max={40} suffix="anni" />
              </>)}
              {activeTab === 'famiglia' && (<>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>ℹ️ Per i figli under 21 è previsto l'Assegno Unico INPS (non calcolato qui).</p>
                <Toggle label="Coniuge a carico" description="Reddito < €2.840,51" checked={coniugeCarico} onChange={setConiugeCarico} />
                <InputField label="Numero figli a carico (totale)" value={numFigli} onChange={setNumFigli} min={0} max={10} />
                <InputField label="Di cui under 24 anni (Assegno Unico)" value={figliUnder24} onChange={(v) => setFigliUnder24(Math.min(v, numFigli))} min={0} max={numFigli} />
                <InputField label="Altri familiari a carico" value={altriFamiliari} onChange={setAltriFamiliari} min={0} max={5} />
              </>)}
              {activeTab === 'benefit' && (<>
                <h4 style={{ fontSize: '13px', color: '#1e3a5f', marginBottom: '12px' }}>🍽️ Buoni pasto</h4>
                <InputField label="Valore giornaliero" value={buoniPasto} onChange={setBuoniPasto} prefix="€" min={0} max={15} step={0.5} />
                <InputField label="Giorni lavorativi annui" value={giorniBuoniPasto} onChange={setGiorniBuoniPasto} min={100} max={260} suffix="gg" />
                <Toggle label="Buoni pasto elettronici" description="Soglia esenzione €8 (vs €4 cartacei)" checked={buoniPastoElettronici} onChange={setBuoniPastoElettronici} />
                <h4 style={{ fontSize: '13px', color: '#1e3a5f', margin: '16px 0 12px' }}>🚗 Auto aziendale</h4>
                <Toggle label="Auto aziendale ad uso promiscuo" checked={autoAziendale} onChange={setAutoAziendale} />
                {autoAziendale && <InputField label="Fringe benefit annuo (tabelle ACI)" value={fringeBenefitAuto} onChange={setFringeBenefitAuto} prefix="€" min={1000} max={10000} />}
                <h4 style={{ fontSize: '13px', color: '#1e3a5f', margin: '16px 0 12px' }}>🎁 Welfare e premi</h4>
                <InputField label="Welfare aziendale annuo" value={welfare} onChange={setWelfare} prefix="€" min={0} max={10000} />
                <InputField label="Premio di risultato annuo" value={premioRisultato} onChange={setPremioRisultato} prefix="€" min={0} max={10000} />
                <InputField label="Ore straordinario annue stimate" value={oreStraordinario} onChange={setOreStraordinario} min={0} max={250} suffix="ore" />
              </>)}
              {activeTab === 'sgravi' && (<>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', padding: '10px', background: '#fef3c7', borderRadius: '8px' }}>⚠️ Gli sgravi non sono cumulabili. Seleziona solo quello applicabile.</p>
                <Toggle label="Esonero giovani under 36" description="60% contributi per 3 anni" checked={sgravioGiovani} onChange={(v) => { setSgravioGiovani(v); if(v) { setSgravioDonne(false); setApprendistato(false); }}} />
                <Toggle label="Esonero donne svantaggiate" description="60% contributi" checked={sgravioDonne} onChange={(v) => { setSgravioDonne(v); if(v) { setSgravioGiovani(false); setApprendistato(false); }}} />
                <Toggle label="Apprendistato" description="Aliquota ridotta ~11.61%" checked={apprendistato} onChange={(v) => { setApprendistato(v); if(v) { setSgravioGiovani(false); setSgravioDonne(false); }}} />
                <div style={{ height: '16px' }} />
                <Toggle label="Decontribuzione Sud" description="30% riduzione (cumulabile, solo Sud)" checked={decontribuzioneSud} onChange={setDecontribuzioneSud} />
                {calcoli.descrizioneEsonero && <div style={{ marginTop: '16px', padding: '12px', background: '#ecfdf5', borderRadius: '8px' }}><p style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>✅ {calcoli.descrizioneEsonero}</p><p style={{ fontSize: '14px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>Risparmio: {formatCurrency(calcoli.risparmioContributi)}/anno</p></div>}
              </>)}
              {activeTab === 'altro' && (<>
                <h4 style={{ fontSize: '13px', color: '#1e3a5f', marginBottom: '12px' }}>🏥 Assicurazioni e previdenza</h4>
                <InputField label="Assicurazione sanitaria (costo azienda)" value={assicurazioneIntegrativa} onChange={setAssicurazioneIntegrativa} prefix="€" min={0} max={5000} />
                <InputField label="Prev. complementare (contributo dipendente)" value={previdenzaComplementare} onChange={setPrevidenzaComplementare} prefix="€" min={0} max={5164} />
                <InputField label="Prev. complementare (contributo azienda)" value={contributoAziendaPrevCompl} onChange={setContributoAziendaPrevCompl} prefix="€" min={0} max={5164} />
                <h4 style={{ fontSize: '13px', color: '#1e3a5f', margin: '16px 0 12px' }}>📋 Costi una tantum</h4>
                <InputField label="Costi selezione/assunzione" value={costiSelezione} onChange={setCostiSelezione} prefix="€" min={0} max={10000} />
              </>)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', color: 'white' }}>
              <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Costo totale annuo azienda</p>
              <p style={{ fontSize: '32px', fontWeight: '700', marginBottom: '6px' }}>{formatCurrency(calcoli.costoTotaleAnnuo)}</p>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px' }}>+{calcoli.maggiorazionePercentuale.toFixed(1)}% rispetto alla RAL</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', color: 'white' }}>
              <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Netto annuo dipendente</p>
              <p style={{ fontSize: '32px', fontWeight: '700', marginBottom: '6px' }}>{formatCurrency(calcoli.nettoAnnuo)}</p>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px' }}>{calcoli.percentualeNetto.toFixed(1)}% della RAL</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[{ l: 'Costo mensile', v: calcoli.costoMensile, c: '#22c55e' }, { l: 'Netto mensile (÷12)', v: calcoli.nettoMensile, c: '#3b82f6' }, { l: 'Costo orario', v: calcoli.costoOrario, c: '#1e3a5f' }, { l: 'Netto mensile (÷14)', v: calcoli.nettoMensileOrdinario, c: '#3b82f6' }].map((x, i) => <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>{x.l}</p><p style={{ fontSize: '18px', fontWeight: '700', color: x.c }}>{formatCurrency(x.v)}</p></div>)}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#22c55e' }}>🏢 Costo azienda</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                {[{ l: 'RAL effettiva', v: calcoli.ralEffettiva }, calcoli.costoStraordinariLordo > 0 && { l: 'Straordinari', v: calcoli.costoStraordinariLordo }, { l: `Contributi INPS (${(calcoli.aliquotaINPSEffettiva*100).toFixed(1)}%)`, v: calcoli.contributiINPS }, { l: 'INAIL', v: calcoli.contributiINAIL }, { l: 'TFR', v: calcoli.tfr }, { l: 'Fondi (Est/Quas)', v: calcoli.fondoEst + calcoli.fondoQuas }, calcoli.costoScatti > 0 && { l: 'Scatti anzianità', v: calcoli.costoScatti + calcoli.contributiScatti }, calcoli.costoBuoniPastoAzienda > 0 && { l: 'Buoni pasto', v: calcoli.costoBuoniPastoAzienda }, (calcoli.welfareEsente + calcoli.welfareImponibile) > 0 && { l: 'Welfare', v: calcoli.welfareEsente + calcoli.welfareImponibile }, calcoli.premioRisultato > 0 && { l: 'Premio risultato', v: calcoli.premioRisultato }, calcoli.assicurazioneIntegrativa > 0 && { l: 'Assicurazione', v: calcoli.assicurazioneIntegrativa }, calcoli.contributoAziendaPrevCompl > 0 && { l: 'Prev. complementare', v: calcoli.contributoAziendaPrevCompl }, calcoli.costiSelezione > 0 && { l: 'Costi selezione', v: calcoli.costiSelezione }].filter(Boolean).map((r, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}><span style={{ color: '#64748b' }}>{r.l}</span><span style={{ fontWeight: '600', color: '#1e3a5f' }}>{formatCurrency(r.v)}</span></div>)}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>👤 Busta paga</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                {[{ l: 'Imponibile previdenziale', v: calcoli.imponibilePrevidenziale }, { l: '− INPS dipendente (9.19%)', v: -calcoli.contributiINPSDipendente }, calcoli.previdenzaComplementare > 0 && { l: '− Prev. complementare', v: -calcoli.previdenzaComplementare }, { l: '= Imponibile fiscale', v: calcoli.imponibileFiscale, h: true }, { l: 'IRPEF lorda', v: calcoli.irpefLorda }, { l: '− Detrazioni lavoro', v: -calcoli.detrazioniLavoro }, calcoli.detrazioniConiuge > 0 && { l: '− Detrazioni coniuge', v: -calcoli.detrazioniConiuge }, calcoli.detrazioniFigli > 0 && { l: '− Detrazioni figli', v: -calcoli.detrazioniFigli }, calcoli.detrazioniAltri > 0 && { l: '− Detrazioni altri', v: -calcoli.detrazioniAltri }, { l: '= IRPEF netta', v: calcoli.irpefNetta, h: true }, calcoli.impostaPremio > 0 && { l: 'Imposta premio (5%)', v: calcoli.impostaPremio }, { l: 'Add. regionale', v: calcoli.addizionaleRegionale }, { l: 'Add. comunale', v: calcoli.addizionaleComunale }, calcoli.trattamentoIntegrativo > 0 && { l: '+ Tratt. integrativo', v: calcoli.trattamentoIntegrativo, p: true }, calcoli.buoniPastoEsenti > 0 && { l: '+ Buoni pasto esenti', v: calcoli.buoniPastoEsenti, p: true }].filter(Boolean).map((r, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: r.h ? '#f0f9ff' : r.p ? '#ecfdf5' : '#f8fafc', borderRadius: '6px' }}><span style={{ color: '#64748b' }}>{r.l}</span><span style={{ fontWeight: '600', color: r.v < 0 ? '#ef4444' : r.p ? '#22c55e' : '#1e3a5f' }}>{r.v < 0 ? '-' : ''}{formatCurrency(Math.abs(r.v))}</span></div>)}
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}><strong>⚠️ Nota:</strong> Simulazione indicativa basata su CCNL Commercio 2024. Per calcoli precisi consultare un consulente del lavoro.</div>
      </div>
    </div>
  );
}

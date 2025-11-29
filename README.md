# webscope_oscilloscope

## 📘Description
Web application for visualizing oscilloscope signals (current vs. time) from CSV log files.

## 🧰Features
- Real-time signal plotting with zoom
- Statistics calculation (minimum, maximum, average)
- A-B measurement cursors
- SVG graph export

## 🐳Technologies
- HTML, CSS, JavaScript
- ECharts.js and PapaParse
- Docker and GitHub Actions

## 🧭Overview of Main Tasks
- [X] ~~Implement Base HTML with CSV Upload~~
    - [X] ~~Create initial project structure (index.html, script.js, styles.css)~~
    - [X] ~~Add CSV upload input (<input type="file" accept=".csv">)~~
    - [X] ~~Display selected filename in UI~~
    - [X] ~~Add container for controls and statistics~~
    - [x] ~~Implement basic file reading (JavaScript FileReader)~~
    - [X] ~~Validate file extension (.csv)~~
    - [x] ~~Error handling for empty/invalid file~~
    - [X] ~~Console output to confirm file loading~~
    - [X] ~~Prepare DOM placeholders for future features (stats, charts, cursors)~~

- [X] ~~Add Calculations (Sample Count, Min, Max, Average)~~
    - [X] ~~Integrate PapaParse~~
    - [X] ~~Parse CSV into a structured dataset~~
    - [X] ~~Extract required columns: Time (s), Current (mA)~~
    - [X] ~~Validate numeric conversion (filter invalid rows)~~
    - [X] ~~Calculate total samples (N points)~~
    - [X] ~~Calculate minimum current value~~
    - [X] ~~Calculate maximum current value~~
    - [X] ~~Calculate average current value~~
    - [X] ~~Display computed values in UI fields~~
    - [X] ~~Add warning if CSV contains malformed data~~
    - [X] ~~Create test CSV samples for validation (tests/sample.csv)~~

- [ ] Implement CSS and Full UI Styling
    - [X] ~~Create responsive layout container~~
    - [X] ~~Style upload button and status text~~
    - [X] ~~Add bordered panels for vertical scale controls, visualization controls, quick actions~~
    - [X] ~~Style global statistics cards~~
    - [ ] Style cursor analysis section (dark digital-style panels)
    - [X] ~~Add consistent button styles (primary, secondary)~~
    - [X] ~~Add hover/focus states for better UX~~
    - [X] ~~Ensure mobile/tablet responsiveness~~
    - [X] ~~Add consistent spacing, padding, and typography~~

- [X] ~~Implement Chart Rendering~~
    - [X] ~~Add ECharts script~~
    - [X] ~~Create <div id="chart-container"> with responsive size~~
    - [X] ~~Convert parsed CSV values into chart-ready arrays~~
    - [X] ~~Render waveform (Current vs Time)~~
    - [X] ~~Add zooming (dataZoom)~~
    - [X] ~~Add panning (inside zoom)~~
    - [X] ~~Add tooltip on hover~~
    - [X] ~~Add optional point display toggle~~
    - [X] ~~Handle chart updates when new CSV is loaded~~
    - [X] ~~Add error handling for empty or invalid dataset~~

- [X] ~~Implement Markers / Cursors~~
    - [X] ~~Capture click events on the chart~~
    - [X] ~~Identify nearest data point to cursor click~~
    - [X] ~~Assign cursor A on first click~~
    - [X] ~~Assign cursor B on second click~~
    - [X] ~~Add visible markers for A and B (scatter points)~~
    - [X] ~~Highlight selected region (ECharts markArea)~~
    - [X] ~~Compute Δt for selected interval~~
    - [X] ~~Compute points in interval~~
    - [X] ~~Compute min, max, average value in cursor region~~
    - [X] ~~Display computed values in the cursor analysis panel~~
    - [X] ~~Add “Clear Cursors” button functionality~~
    - [X] ~~Add “Show/Hide points” interaction if needed~~

- [ ] Implement Export to Image / SVG
    - [X] ~~Extract SVG from ECharts container~~
    - [X] ~~Append annotation text (statistics) into SVG~~
    - [X] ~~Build downloadable file (export.svg)~~
    - [X] ~~Add “Export Graph (SVG)” button~~
    - [X] ~~Disable export button if no data loaded~~
    - [X] ~~Validate exported SVG opens in Chrome, Firefox, Inkscape~~
    - [ ] (Optional) Add PNG export

- [ ] Implement Documentation and Report
    - [X] ~~Create README.md with project description, setup and usage instructions, screenshots, CI and Docker instructions~~
    - [ ] Create relatorio.md including branching strategy (Git Flow), change control, CI/CD workflow, versioning strategy, issue lifecycle, team reflections
    - [X] Create CHANGELOG.md and populate with:
        - [X] ~~v0.1.0 — Initial HTML + upload~~
        - [X] ~~v1.0.0 — Full features~~
        - [ ] v1.X.X — Updates...
- **Versionamento :** Usamos pouco versionamento, mas aprendemos a criar tags e releases.
- **Rastreabilidade via Issues e Pull Requests:** Essa é uma função que ajuda muito a comunicação entre os membros do time e o controle das mudanças dentro do programa,quando o Arthur modifica algo eu podia aprovar ou não a modificação, e vice versa, isso facilita muito o andamento do trabalho à distancia.
- **Automação de CI/CD:** Os benefícios da integração e automação contínua para detectar erros cedo e manter a aplicação funcional.
- **Documentação e Comunicação:** O progresso do trabalho é posto no readme.md, isso faz com que controlemos o que já foi feito e o que ainda precisa ser feito, asim como considerar se é realmente necessária colocando-a como opicional. 
- **Ambiente Replicável:** Usar Docker ajuda, principalmente porque é uma forma de atualizar o projeto sem mexer no projeto original, e facilita a utilização de branches.
- **Colaboração Multidisciplinar:** Simular diferentes posições durante o projeto nos dá uma visão maior de como funciona a organização de um projeto de software, em cada posição, como testar e aprovar uma modificação, ou ter a sua atualização negada porque ficou errada, fora ter de lidar com requests e tarefas que precisam ser realizadas, e que nem sempre serão, seja por falta de capacidade técnica, ou discordancia interna, ou por falta de tempo.  

## ⚠️ Dificuldades Encontradas

Durante o projeto, enfrentamos os seguintes desafios e  conseguirmos solucioná-los com pesquisa, e utilização de fóruns.

- **Bloqueio em Pull por Autenticação:** Se tem algo que pode prejudicar é a autenticação de membros, para atualizar tivemos problemas de atutenticação, que não se resolveram com troca de senha, a solução foi utilizar tokens temporários (modo classico) e criar uma permissão geral de modificação dentro do token com permissões customizados.
- **Conflitos de Merge em Branches:** As vezes os branches não deram muito certo, com conflitos por falta de habilidade com o ambiente.

- **Divergências na Estrutura das Issues:** No inicio do projeto tivemos muita dificuldade com a forma de estruturar as issues, tentar padronizar a estrutura das issues para que fosse mais fácil entender.

---

Usar a plataforma foi a forma mais interessante de aprender as  e boas práticas de SCM e entender como e quando devemos utilizar essas ferramentas.
## 👥 Authors
- **Arthur Oliveira**
- **Marinel Borges**

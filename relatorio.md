# 📘 Relatório de Práticas e Experiências em SCM

## ✔️ Principais Aprendizados

### 1. Versionamento
O versionamento apresentou alguns desafios, especialmente devido às diferenças de abordagem entre o desenvolvedor e o gerente do projeto. Apesar disso, aprendemos a utilizar tags e releases, entendendo a importância de manter um histórico claro e organizado das entregas e modificações.

### 2. Rastreabilidade via Issues e Pull Requests
A rastreabilidade foi uma das funcionalidades mais úteis. O uso de Issues e Pull Requests permitiu:
- Identificar cada alteração realizada e por quem foi feita;
- Acompanhar o motivo das mudanças;
- Aprovar ou rejeitar atualizações de forma estruturada.

Em caso de falha, conseguimos retornar a uma versão funcional anterior graças ao rastreamento detalhado das modificações.

### 3. Automação de CI/CD
Compreendemos os benefícios da integração e entrega contínua, especialmente para:
- Detectar erros de forma antecipada;
- Manter a aplicação estável;
- Facilitar o fluxo geral de desenvolvimento.

Apesar de não termos explorado todos os recursos, ficou clara a relevância dessas práticas para garantir qualidade no software.

### 4. Documentação e Comunicação
O uso do arquivo `README.md` foi fundamental para registrar o andamento do projeto, organizar o que já havia sido concluído e o que ainda precisava ser feito. Isso ajudou a:
- Priorizar tarefas;
- Registrar decisões importantes;
- Indicar o que era essencial e o que poderia ser opcional.

### 5. Ambiente Replicável
Embora o Docker seja valioso para garantir ambientes reproduzíveis, **ele não foi utilizado neste projeto**, já que todos os itens necessários estavam embarcados diretamente na aplicação, incluindo scripts JavaScript de bibliotecas externas. Mesmo assim, reforçamos entendimento sobre sua utilidade em cenários com múltiplas versões e ambientes isolados.

### 6. Colaboração Multidisciplinar
Assumir diferentes papéis durante o projeto trouxe uma compreensão mais ampla sobre a organização e o fluxo de trabalho em desenvolvimento de software. Isso incluiu:
- Testar e aprovar modificações;
- Justificar ou negar atualizações incorretas;
- Gerenciar tarefas com limitações técnicas, divergências internas e prazos curtos.

Essa prática reforçou a importância da colaboração para o sucesso de um projeto.

---

## ⚠️ Dificuldades Encontradas

### 1. Problemas de Autenticação durante Pulls
A autenticação foi um dos maiores obstáculos. Mesmo alterando senhas, os erros persistiam. A solução adotada foi:
- Utilizar tokens temporários (modo clássico);
- Criar permissões personalizadas dentro do token, permitindo atualizações gerais.

### 2. Conflitos de Merge em Branches
Em alguns momentos, os branches apresentaram conflitos devido à falta de experiência com o fluxo de trabalho. Com pesquisa e prática, entendemos melhor como resolver e evitar novos conflitos.

### 3. Divergências na Estrutura das Issues
No início do projeto, houve dificuldade em padronizar a criação das issues. Isso prejudicava o entendimento das tarefas. Com o tempo, definimos uma estrutura mais clara e objetiva.

---

## 📌 Conclusão
"O uso da plataforma proporcionou uma experiência prática extremamente útil para aprender as ferramentas e boas práticas de SCM. Vivenciamos situações reais que ilustraram quando e como aplicar versionamento, rastreabilidade, documentação e colaboração. Mesmo com desafios, o aprendizado adquirido foi significativo e contribuiu para uma compreensão mais profunda sobre organização, controle e fluxo de desenvolvimento em projetos de software." - Marinel

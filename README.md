# Operação Fim de Semana — convite interativo

Site estático feito com HTML, CSS e JavaScript puro. Não usa servidor, banco de dados, bibliotecas, rastreadores nem serviços externos. As respostas ficam apenas na memória do navegador e **nada é enviado automaticamente**: quem responde decide se copia e compartilha o relatório.

## Arquivos

- `index.html`: estrutura das telas (convite, data, saudade, estratégia, preferências, perfil, contrato e relatório).
- `style.css`: identidade visual (preto, roxo, vinho e verde esmeralda) e responsividade.
- `script.js`: navegação, respostas, botões fugitivos, índice de viabilidade e cópia do relatório.

## Testar no computador

Abra o `index.html` com dois cliques no navegador. Não precisa instalar nada.

## Publicar gratuitamente no GitHub Pages

1. **Criar o repositório.** Entre em [github.com](https://github.com), clique em **New** e dê um nome (por exemplo, `convite-alexia`). Marque **Public** e clique em **Create repository**.
2. **Enviar os arquivos.** Na página do repositório, clique em **uploading an existing file**, arraste `index.html`, `style.css` e `script.js` (o `README.md` é opcional) e clique em **Commit changes**. Os arquivos precisam ficar na raiz, sem pasta por fora.
3. **Abrir as configurações.** No repositório, clique na aba **Settings**.
4. **Ativar o GitHub Pages.** No menu lateral, clique em **Pages**. Em **Build and deployment**, escolha **Deploy from a branch**. Em **Branch**, selecione `main` e a pasta `/ (root)`, e clique em **Save**.
5. **Pegar o link público.** Espere de 1 a 3 minutos e atualize a página de **Pages**. O endereço aparece no topo, no formato `https://SEU-USUARIO.github.io/convite-alexia/`.
6. **Atualizar depois.** Edite os arquivos no computador, abra o repositório, clique em **Add file > Upload files**, envie os arquivos alterados (com o mesmo nome) e faça o **Commit**. O site é atualizado sozinho em poucos minutos. Se não mudar, force a atualização do navegador com Ctrl+F5.

> Repositórios públicos mostram o código a qualquer pessoa, mas o site não guarda nenhuma resposta. Para um link menos óbvio, use um nome de repositório discreto.

## Personalizar

- Datas e horários: edite os botões na seção `#date` do `index.html`.
- Frases e níveis de saudade: edite os textos no começo do `script.js` (`taunts` e `levels`).
- Cores: variáveis no topo do `style.css`.

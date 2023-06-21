# 2023-1-MeasureSoftGram-Action

Esta é uma ação do Github que usa o serviço [MeasureSoftGram](https://github.com/fga-eps-mds/2023-1-MeasureSoftGram-Service), baseando-se nos resultados dos testes de ferramentas de analise de codigo como o Sonarqube, e adiciona os resultados como anotações em seus pull requests.

**Nota:** Esta ação é destinada a ser executada quando um pull request é feito para as branches main ou develop.

## Sobre o MeasureSoftGram
O MeasureSoftGram é um robusto sistema de gerenciamento e avaliação de qualidade de software. Ele atua como uma ferramenta de apoio ao planejamento e comparação das qualidades nas releases, fornecendo uma análise abrangente da qualidade do produto e do processo. Ele retorna valores das métricas analisadas de software e avalia a qualidade a partir de modelos algébricos, analisando múltiplos atributos de qualidade. O MeasureSoftGram é um projeto de software livre, com foco em prover uma ferramenta acessível e eficiente para a gestão da qualidade do software.

## Exemplo de Saída

![Exemplo de Saída](./assets/images/msgram-msg.png)

## Uso
Para utilizar o MeasureSoftGram no seu repositório GitHub, crie um novo fluxo de trabalho do GitHub Actions (por exemplo, `msgram-analysis.yml`) no diretório `.github/workflows`. No novo arquivo, insira o seguinte código:

```yaml
on:
  pull_request:
    branches: [ main ]

jobs:
  msgram_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Rodar a action do MeasureSoftGram
        uses: ./ # Usa uma ação no diretório raiz
        id: msgram
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          sonarProjectKey: "<proprietário do repositorio>_<nome do repositório>"
          msgramServiceToken: ${{ secrets.MSGRAM_SERVICE_TOKEN }}
          productName: "<Nome do produto>"
```

## Entradas

| entrada | obrigatório | descrição |
| ------- | ----------- | --------- |
| `host` | não | URL do servidor SonarQube. A url padrão é 'https://sonarcloud.io'. |
| `sonartoken` | não | Token do SonarQube. Talvez isso seja necessário caso o repositorio seja privado. |
| `sonarProjectKey` | não | Chave do projeto no SonarQube. A chave padrão é coletada a partir das informações coletadas do repositorio no github '<proprietário do repositorio>_<nome do repositório>'. |
| `githubToken` | sim | Token do GitHub. Mais informações em [Token do GitHub](https://docs.github.com/en/actions/reference/authentication-in-a-workflow#about-the-github_token-secret) |
| `productName` | sim | Nome do produto |
| `msgramServiceToken` | sim | Token para acessar o serviço MeasureSoftGram |

Lembre-se que é necessário que você disponha do seu token do GitHub para executar o MeasureSoftGram. Recomendamos o uso dos [Segredos do GitHub](https://docs.github.com/pt/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) para armazenar estas credencia

is de forma segura.

## Roadmap

Estamos sempre trabalhando para melhorar e expandir as capacidades do MeasureSoftGram. Aqui estão algumas atualizações planejadas:

- [x] **Persistência dos resultados:** Em futuras atualizações, planejamos permitir o armazenamento dos resultados gerados pelo calculo da action na nossa aplicação web.
- [ ] **Configurações personalizáveis via web:** Planejamos permitir que o usuário altere as configurações a partir do input da ação, puxando do serviço web.
- [ ] **Expansão da integração do Parser:** O [Parser](https://github.com/fga-eps-mds/2023-1-MeasureSoftGram-Parser) irá expandir sua integração com ferramentas de análise para além do SonarQube.
- [ ] **Badges no README:** Planejamos adicionar uma funcionalidade que permitirá aos usuários exibir badges com métricas no README do seu repositório. Com isso, você poderá fornecer uma visão rápida da qualidade do software diretamente no seu README.
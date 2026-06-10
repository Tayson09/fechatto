# API — Módulo de Negociações

**Fechatto / Vortex Technologies**
**Base URL:** `/api/negotiations`
**Autenticação:** todas as rotas exigem sessão ativa via NextAuth (cookie de sessão). Requisições sem sessão retornam `401`.

---

## Índice

- [Listar negociações](#get-apinegotiations)
- [Criar negociação](#post-apinegotiations)
- [Buscar negociação por ID](#get-apinegotiationsid)
- [Atualizar notas](#patch-apinegotiationsid)
- [Encerrar negociação](#post-apinegotiationsidclose)
- [Listar visitas](#get-apinegotiationsidvisits)
- [Registrar visita](#post-apinegotiationsidvisits)
- [Erros comuns](#erros-comuns)

---

## `GET /api/negotiations`

Lista as negociações do corretor autenticado.

### Query params

| Param    | Tipo     | Obrigatório | Descrição                                          |
|----------|----------|-------------|----------------------------------------------------|
| `page`   | `number` | Não         | Página atual. Default: `1`                         |
| `limit`  | `number` | Não         | Itens por página. Default: `20`, máximo: `100`     |
| `status` | `string` | Não         | Filtro por status: `IN_PROGRESS`, `CLOSED_WON`, `CLOSED_LOST`. Valores inválidos são ignorados silenciosamente. |

### Resposta de sucesso — `200 OK`

```json
{
  "data": [
    {
      "id": "clx1abc123",
      "status": "IN_PROGRESS",
      "notes": "Cliente muito interessado",
      "createdAt": "2025-03-10T14:00:00.000Z",
      "client": {
        "id": "clx2def456",
        "name": "Ana Souza"
      },
      "property": {
        "id": "clx3ghi789",
        "address": "Rua das Flores, 42",
        "city": "São Paulo",
        "price": "850000.00"
      }
    }
  ],
  "page": 1,
  "limit": 20
}
```

---

## `POST /api/negotiations`

Cria uma nova negociação vinculando um cliente a um imóvel.

> **Regra de negócio:** toda negociação nasce com `status: IN_PROGRESS`. Não é possível definir o status na criação.

> **Regra de negócio:** o campo `commission` é capturado automaticamente do imóvel no momento da criação como snapshot. Não é enviado no body.

### Body

```json
{
  "clientId": "clx2def456",
  "propertyId": "clx3ghi789",
  "notes": "Cliente quer visitar no fim de semana"
}
```

| Campo        | Tipo     | Obrigatório | Descrição                        |
|--------------|----------|-------------|----------------------------------|
| `clientId`   | `string` | Sim         | ID do cliente (deve pertencer ao corretor autenticado) |
| `propertyId` | `string` | Sim         | ID do imóvel (deve pertencer ao corretor autenticado) |
| `notes`      | `string` | Não         | Observações iniciais              |

### Resposta de sucesso — `201 Created`

```json
{
  "data": {
    "id": "clx4jkl012",
    "userId": "clx0usr000",
    "clientId": "clx2def456",
    "propertyId": "clx3ghi789",
    "status": "IN_PROGRESS",
    "commission": "25500.00",
    "notes": "Cliente quer visitar no fim de semana",
    "closedAt": null,
    "createdAt": "2025-03-10T14:30:00.000Z",
    "updatedAt": "2025-03-10T14:30:00.000Z"
  }
}
```

### Erros possíveis

| Status | Motivo |
|--------|--------|
| `404`  | Cliente ou imóvel não encontrado (ou não pertence ao corretor) |
| `422`  | Body inválido — `clientId` ou `propertyId` ausentes |

---

## `GET /api/negotiations/[id]`

Retorna uma negociação completa com dados do cliente, imóvel e histórico de visitas.

### Resposta de sucesso — `200 OK`

```json
{
  "data": {
    "id": "clx4jkl012",
    "status": "IN_PROGRESS",
    "commission": "25500.00",
    "notes": "Cliente quer visitar no fim de semana",
    "closedAt": null,
    "createdAt": "2025-03-10T14:30:00.000Z",
    "updatedAt": "2025-03-10T14:30:00.000Z",
    "client": {
      "id": "clx2def456",
      "name": "Ana Souza",
      "phone": "11999990000"
    },
    "property": {
      "id": "clx3ghi789",
      "address": "Rua das Flores, 42",
      "city": "São Paulo",
      "price": "850000.00",
      "status": "AVAILABLE"
    },
    "visits": [
      {
        "id": "clx5mno345",
        "date": "2025-03-12T10:00:00.000Z",
        "result": "Cliente gostou, pediu proposta",
        "createdAt": "2025-03-12T18:00:00.000Z"
      }
    ]
  }
}
```

> As visitas vêm ordenadas por data decrescente (mais recente primeiro).

### Erros possíveis

| Status | Motivo |
|--------|--------|
| `404`  | Negociação não encontrada ou não pertence ao corretor |

---

## `PATCH /api/negotiations/[id]`

Atualiza as notas de uma negociação.

> **Por que PATCH e não PUT?** A operação é parcial — apenas `notes` é atualizável por esta rota. Transições de status têm endpoints próprios.

### Body

```json
{
  "notes": "Cliente solicitou segunda visita para semana que vem"
}
```

| Campo   | Tipo     | Obrigatório | Descrição       |
|---------|----------|-------------|-----------------|
| `notes` | `string` | Sim         | Novas observações |

### Resposta de sucesso — `200 OK`

```json
{
  "data": {
    "id": "clx4jkl012",
    "notes": "Cliente solicitou segunda visita para semana que vem",
    "updatedAt": "2025-03-13T09:00:00.000Z"
  }
}
```

### Erros possíveis

| Status | Motivo |
|--------|--------|
| `404`  | Negociação não encontrada |
| `422`  | Body inválido |

---

## `POST /api/negotiations/[id]/close`

Encerra uma negociação como ganha ou perdida.

> **Regra de negócio — `CLOSED_WON`:** ao fechar como ganha, o status do imóvel é alterado para `SOLD` de forma atômica dentro de uma transação. Se qualquer parte falhar, nenhuma alteração é salva.

> **Regra de negócio — `CLOSED_LOST`:** ao fechar como perdida, o imóvel permanece `AVAILABLE`.

> **Regra de negócio:** `commission` é capturado do imóvel no momento do fechamento como snapshot imutável. Alterações futuras no imóvel não afetam o histórico financeiro desta negociação.

> **Atenção:** negociações já encerradas (`CLOSED_WON` ou `CLOSED_LOST`) não podem ser reabertas por esta rota.

### Body

```json
{
  "status": "CLOSED_WON",
  "notes": "Proposta aceita, contrato assinado"
}
```

| Campo    | Tipo     | Obrigatório | Descrição                                  |
|----------|----------|-------------|--------------------------------------------|
| `status` | `string` | Sim         | `CLOSED_WON` ou `CLOSED_LOST` — único valor aceito. `IN_PROGRESS` é rejeitado pelo Zod. |
| `notes`  | `string` | Não         | Observações finais                          |

### Resposta de sucesso — `200 OK`

```json
{
  "data": {
    "id": "clx4jkl012",
    "status": "CLOSED_WON",
    "commission": "25500.00",
    "closedAt": "2025-03-15T16:00:00.000Z",
    "updatedAt": "2025-03-15T16:00:00.000Z"
  }
}
```

### Erros possíveis

| Status | Motivo |
|--------|--------|
| `404`  | Negociação não encontrada |
| `422`  | `status` ausente ou com valor inválido (ex: `IN_PROGRESS`) |

---

## `GET /api/negotiations/[id]/visits`

Retorna o histórico de visitas de uma negociação em ordem cronológica decrescente.

> A rota verifica que a negociação pertence ao corretor autenticado antes de retornar os dados. Isso impede que um usuário acesse visitas de negociações alheias.

### Resposta de sucesso — `200 OK`

```json
{
  "data": [
    {
      "id": "clx5mno345",
      "date": "2025-03-12T10:00:00.000Z",
      "result": "Cliente gostou, pediu proposta",
      "createdAt": "2025-03-12T18:00:00.000Z"
    },
    {
      "id": "clx6pqr678",
      "date": "2025-03-08T14:00:00.000Z",
      "result": null,
      "createdAt": "2025-03-08T14:30:00.000Z"
    }
  ]
}
```

### Erros possíveis

| Status | Motivo |
|--------|--------|
| `404`  | Negociação não encontrada ou não pertence ao corretor |

---

## `POST /api/negotiations/[id]/visits`

Registra uma nova visita em uma negociação.

### Body

```json
{
  "date": "2025-03-18T10:00:00.000Z",
  "result": "Muito interessado, voltará com o cônjuge"
}
```

| Campo    | Tipo            | Obrigatório | Descrição                                        |
|----------|-----------------|-------------|--------------------------------------------------|
| `date`   | `string` (ISO 8601) | Sim     | Data e hora da visita. Aceita string ISO ou objeto Date. |
| `result` | `string`        | Não         | Resultado ou observação da visita. Pode ser registrado depois. |

### Resposta de sucesso — `201 Created`

```json
{
  "data": {
    "id": "clx7stu901",
    "negotiationId": "clx4jkl012",
    "date": "2025-03-18T10:00:00.000Z",
    "result": "Muito interessado, voltará com o cônjuge",
    "createdAt": "2025-03-18T10:05:00.000Z"
  }
}
```

### Erros possíveis

| Status | Motivo |
|--------|--------|
| `404`  | Negociação não encontrada |
| `422`  | `date` ausente ou formato inválido |

---

## Erros comuns

Todos os erros seguem o mesmo formato de resposta:

```json
{
  "error": "Mensagem descritiva do erro"
}
```

Erros de validação Zod retornam detalhes adicionais:

```json
{
  "error": "Dados inválidos",
  "details": {
    "fieldErrors": {
      "clientId": ["Required"]
    },
    "formErrors": []
  }
}
```

| Status | Quando ocorre |
|--------|---------------|
| `401`  | Sessão ausente ou expirada |
| `404`  | Recurso não encontrado ou não pertence ao corretor autenticado |
| `422`  | Body com dados inválidos ou campos obrigatórios ausentes |
| `500`  | Erro interno inesperado |

---

*Fechatto — Módulo de Negociações v1.0 · Vortex Technologies*
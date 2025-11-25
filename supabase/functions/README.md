# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Claims Rule Engine.

## Structure

Each function should be in its own directory:

```
functions/
├── function-name/
│   ├── index.ts       # Main function code
│   └── README.md      # Function documentation
└── README.md
```

## Creating a New Function

### Using Supabase MCP

```typescript
// Example: Create a function via MCP
mcp__supabase__deploy_edge_function({
  name: "function-name",
  entrypoint_path: "index.ts",
  files: [
    {
      name: "index.ts",
      content: `// function code here`
    }
  ]
})
```

### Local Development

1. Create function directory: `mkdir supabase/functions/function-name`
2. Create `index.ts` with your function code
3. Deploy using MCP tool or Supabase CLI

## Function Template

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Your function logic here
    const { data, error } = await supabase
      .from('your_table')
      .select('*')

    if (error) throw error

    return new Response(JSON.stringify({ data }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

## Planned Functions

### `calculate-dataset-quality`
- **Purpose**: Compute completeness and quality metrics for datasets
- **Input**: `{ dataset_id: number }`
- **Output**: `{ completeness_percentage: number, quality_score: number, missing_critical_columns: string[] }`
- **Logic**:
  - Join `dataset_column_presence` with `dimensions`
  - Calculate percentage of present columns
  - Check for critical missing columns
  - Compute quality score based on data types and completeness

## Deployment

Functions are deployed to: `https://cayqhjjpqucsoymjvbzr.supabase.co/functions/v1/function-name`

## Invoking Functions

```typescript
import { supabase } from '@/lib/db/supabase'

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* your params */ }
})
```

'use server';

/**
 * @fileOverview Summarizes a supplier's transaction history using AI.
 *
 * - summarizeSupplierHistory - A function that summarizes the supplier history.
 * - SummarizeSupplierHistoryInput - The input type for the summarizeSupplierHistory function.
 * - SummarizeSupplierHistoryOutput - The return type for the summarizeSupplierHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSupplierHistoryInputSchema = z.object({
  supplierName: z.string().describe('The name of the supplier.'),
  transactionHistory: z.string().describe('The transaction history with the supplier.'),
});
export type SummarizeSupplierHistoryInput = z.infer<typeof SummarizeSupplierHistoryInputSchema>;

const SummarizeSupplierHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the supplier transaction history.'),
});
export type SummarizeSupplierHistoryOutput = z.infer<typeof SummarizeSupplierHistoryOutputSchema>;

export async function summarizeSupplierHistory(input: SummarizeSupplierHistoryInput): Promise<SummarizeSupplierHistoryOutput> {
  return summarizeSupplierHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSupplierHistoryPrompt',
  input: {schema: SummarizeSupplierHistoryInputSchema},
  output: {schema: SummarizeSupplierHistoryOutputSchema},
  prompt: `You are an expert parts manager who specializes in supplier relationships.

You will use the transaction history to summarize the key trends and patterns in our business relationship with the supplier.

Supplier Name: {{{supplierName}}}
Transaction History: {{{transactionHistory}}}`,
});

const summarizeSupplierHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeSupplierHistoryFlow',
    inputSchema: SummarizeSupplierHistoryInputSchema,
    outputSchema: SummarizeSupplierHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

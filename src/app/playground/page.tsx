import PromptBuilder from '@/components/playground/PromptBuilder';

export const metadata = {
  title: 'Agent Playground - La Tinta Dashboard',
  description: 'Construye y modifica el System Prompt de tu agente de IA de ventas',
};

export default function PlaygroundPage() {
  return <PromptBuilder />;
}

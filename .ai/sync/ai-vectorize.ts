/**
 * Optional vectorization hook.
 *
 * Add your approved embedding provider and credential source here.
 * The default library never sends repository content to the network.
 */
export async function vectorizeContext(): Promise<void> {
  throw new Error("Vectorization provider is not configured.");
}

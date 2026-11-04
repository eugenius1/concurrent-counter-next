import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CounterPage from "@/components/CounterPage";
import { getCounter, isCounterId } from "@/lib/db";

// A counter is found only through its link, so keep it out of search results
export const metadata: Metadata = { robots: { index: false } };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isCounterId(id)) notFound();

  const counter = await getCounter(id);
  if (!counter) notFound();

  return <CounterPage id={counter.id} initialValue={counter.value} />;
}

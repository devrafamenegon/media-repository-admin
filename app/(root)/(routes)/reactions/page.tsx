"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type ReactionType = {
  id: string;
  key: string;
  label: string;
  emoji: string | null;
  order: number;
  isActive: boolean;
};

export default function ReactionsPage() {
  const [items, setItems] = useState<ReactionType[]>([]);
  const [loading, setLoading] = useState(false);

  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newOrder, setNewOrder] = useState<number>(0);
  const [newIsActive, setNewIsActive] = useState(true);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reactions/types?all=1", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("[ReactionsPage] load error", e);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async () => {
    if (!newKey.trim() || !newLabel.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reactions/types", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          key: newKey.trim(),
          label: newLabel.trim(),
          emoji: newEmoji.trim() ? newEmoji.trim() : null,
          order: Number(newOrder) || 0,
          isActive: newIsActive,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setNewKey("");
      setNewLabel("");
      setNewEmoji("");
      setNewOrder(0);
      setNewIsActive(true);

      await load();
      toast.success("Reaction created.");
    } catch (e) {
      console.log("[ReactionsPage] create error", e);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (patch: Partial<ReactionType> & { id: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reactions/types", {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await res.text());

      await load();
      toast.success("Updated.");
    } catch (e) {
      console.log("[ReactionsPage] update error", e);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reactions/types", {
        method: "DELETE",
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(await res.text());

      await load();
      toast.success("Deleted.");
    } catch (e) {
      console.log("[ReactionsPage] delete error", e);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Reactions" description="Manage reaction types (DB-managed, no deploy)" />
        <Separator />

        <div className="space-y-3 rounded-lg border p-4">
          <div className="text-sm font-medium">Create</div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <Input
              placeholder="KEY (ex: LIKE)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Label (ex: Like)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Emoji (ex: 👍)"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Order"
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(Number(e.target.value))}
              disabled={loading}
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={newIsActive}
                  onCheckedChange={(v) => setNewIsActive(Boolean(v))}
                  disabled={loading}
                />
                <span className="text-sm">Active</span>
              </div>
              <Button type="button" onClick={onCreate} disabled={loading || !newKey.trim() || !newLabel.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Existing</div>
            <Button type="button" variant="secondary" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {sorted.map((rt) => (
              <div key={rt.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {rt.emoji ?? "?"} {rt.key}
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(rt.id)} disabled={loading}>
                    Delete
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                  <Input value={rt.key} disabled />
                  <Input
                    defaultValue={rt.label}
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (next !== rt.label) onUpdate({ id: rt.id, label: next });
                    }}
                    disabled={loading}
                  />
                  <Input
                    defaultValue={rt.emoji ?? ""}
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      const normalized = next ? next : null;
                      if (normalized !== rt.emoji) onUpdate({ id: rt.id, emoji: normalized });
                    }}
                    disabled={loading}
                  />
                  <Input
                    type="number"
                    defaultValue={rt.order}
                    onBlur={(e) => {
                      const next = Number(e.target.value);
                      if (next !== rt.order) onUpdate({ id: rt.id, order: next });
                    }}
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={rt.isActive}
                      onCheckedChange={(v) => onUpdate({ id: rt.id, isActive: Boolean(v) })}
                      disabled={loading}
                    />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </div>
            ))}

            {!loading && sorted.length === 0 && (
              <div className="text-sm text-muted-foreground">No reaction types yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


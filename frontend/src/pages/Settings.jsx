import { useState } from "react";
import { ErrorNote, Pill, StatCard } from "../components/Ui.jsx";
import { Cog, Shield, User } from "../components/Icons.jsx";
import { api, ROLE_LABEL } from "../lib/api.js";

export default function Settings({ user, onUpdated, onSignOut }) {
  const [form, setForm] = useState({
    full_name: user.full_name, organisation: user.organisation || "",
  });
  const [state, setState] = useState({ busy: false, error: "", saved: false });

  const save = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: "", saved: false });
    try {
      const updated = await api.updateMe(form);
      onUpdated(updated);
      setState({ busy: false, error: "", saved: true });
    } catch (err) {
      setState({ busy: false, error: err.message, saved: false });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Signed in as" value={user.full_name.split(" ")[0]} icon={User}
                  sub={user.email} />
        <StatCard label="Role" value={ROLE_LABEL[user.role].split(" ")[0]} icon={Shield}
                  sub={ROLE_LABEL[user.role]} />
        <StatCard label="Account" value={user.is_active ? "Active" : "Disabled"} icon={Cog}
                  tone={user.is_active ? "text-brand" : "text-danger"} />
      </div>

      <form onSubmit={save} className="card p-5">
        <h2 className="font-display text-[15px] font-bold">Profile</h2>
        <p className="mt-1 text-xs text-muted">
          Your name and organisation appear on exported reports.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" className="field" value={form.full_name} required
                   onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="org">Organisation</label>
            <input id="org" className="field" value={form.organisation}
                   onChange={(e) => setForm({ ...form, organisation: e.target.value })} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">Email</span>
            <p className="field bg-panel/60 text-muted">{user.email}</p>
          </div>
          <div>
            <span className="label">Role</span>
            <p className="field bg-panel/60 text-muted">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Email and role are changed by an administrator, not here.
        </p>

        {state.error && <div className="mt-4"><ErrorNote>{state.error}</ErrorNote></div>}
        {state.saved && (
          <p className="mt-4 rounded-lg border border-brand/30 bg-brand/10 px-3.5 py-2.5 text-sm text-brand">
            Profile saved.
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button type="submit" className="btn-primary" disabled={state.busy}>
            {state.busy ? "Saving…" : "Save changes"}
          </button>
          <button type="button" className="btn-quiet"
                  onClick={() => setForm({ full_name: user.full_name, organisation: user.organisation || "" })}>
            Reset
          </button>
        </div>
      </form>

      <section className="card p-5">
        <h2 className="font-display text-[15px] font-bold">Access</h2>
        <p className="mt-1 text-sm text-muted">
          Operators and manufacturers see their own batches. Sustainability managers and
          administrators see the whole facility.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.values(ROLE_LABEL).map((r) => (
            <Pill key={r} tone={ROLE_LABEL[user.role] === r ? "brand" : "muted"}>{r}</Pill>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-[15px] font-bold">Session</h2>
        <p className="mt-1 text-sm text-muted">
          Tokens expire after 12 hours. Signing out clears the token from this browser.
        </p>
        <button onClick={onSignOut} className="btn-quiet mt-4 border-danger/40 text-danger">
          Log out
        </button>
      </section>
    </div>
  );
}

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ClipboardList,
  Pencil,
  Plus,
  RefreshCw,
  Ruler,
  Trash2,
  X
} from "lucide-react";
import { api } from "./api";
import type { WorkLog, WorkLogInput, WorkType } from "./types";

const emptyForm: WorkLogInput = {
  performedAt: new Date().toISOString().slice(0, 10),
  workTypeId: "",
  volume: "",
  unit: "м³",
  performerName: "",
  comment: ""
};

const units = ["м³", "м²", "м.п.", "шт.", "т", "час"];

export function App() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [form, setForm] = useState<WorkLogInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [logToDelete, setLogToDelete] = useState<WorkLog | null>(null);
  const [error, setError] = useState("");

  const selectedLog = useMemo(
    () => logs.find((log) => log.id === editingId),
    [editingId, logs]
  );
  const periodLabel = useMemo(() => {
    if (startDate && endDate) return `${startDate} - ${endDate}`;
    if (startDate) return `С ${startDate}`;
    if (endDate) return `До ${endDate}`;
    return "Все даты";
  }, [endDate, startDate]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [types, items] = await Promise.all([
        api.getWorkTypes(),
        api.getWorkLogs({ startDate, endDate, sort })
      ]);

      setWorkTypes(types);
      setLogs(items);
      setForm((current) => ({
        ...current,
        workTypeId: current.workTypeId || types[0]?.id || ""
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ошибка загрузки");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [startDate, endDate, sort]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      workTypeId: workTypes[0]?.id || ""
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      if (editingId) {
        await api.updateWorkLog(editingId, form);
      } else {
        await api.createWorkLog(form);
      }

      resetForm();
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (log: WorkLog) => {
    setEditingId(log.id);
    setForm({
      performedAt: log.performedAt,
      workTypeId: log.workType.id,
      volume: String(log.volume),
      unit: log.unit,
      performerName: log.performerName,
      comment: log.comment
    });
  };

  const handleDelete = async () => {
    if (!logToDelete) return;

    setIsDeleting(true);
    setError("");

    try {
      await api.deleteWorkLog(logToDelete.id);
      if (editingId === logToDelete.id) {
        resetForm();
      }
      setLogToDelete(null);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Ошибка удаления");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="page">
      <section className="topbar">
        <div className="title-block">
          <p className="eyebrow">Строительный объект</p>
          <h1>Журнал работ</h1>
          <p className="hero-copy">Ежедневный учет работ, объемов и исполнителей на площадке.</p>
        </div>
        <button className="icon-button" type="button" onClick={() => void loadData()} title="Обновить">
          <RefreshCw size={18} />
        </button>
      </section>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <section className="stats-grid" aria-label="Сводка журнала">
        <article className="stat-card">
          <ClipboardList size={20} />
          <div>
            <span>{logs.length}</span>
            <p>Записей</p>
          </div>
        </article>
        <article className="stat-card">
          <BriefcaseBusiness size={20} />
          <div>
            <span>{workTypes.length}</span>
            <p>Видов работ</p>
          </div>
        </article>
        <article className="stat-card stat-card-wide">
          <Ruler size={20} />
          <div>
            <span>{periodLabel}</span>
            <p>Период</p>
          </div>
        </article>
      </section>

      <section className="workspace">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">{editingId ? "Редактирование" : "Новая запись"}</p>
              <h2>{editingId ? selectedLog?.workType.name : "Выполненные работы"}</h2>
            </div>
            {editingId && (
              <button className="icon-button muted" type="button" onClick={resetForm} title="Отменить">
                <X size={18} />
              </button>
            )}
          </div>

          <label>
            Дата выполнения
            <input
              required
              type="date"
              value={form.performedAt}
              onChange={(event) => setForm({ ...form, performedAt: event.target.value })}
            />
          </label>

          <label>
            Вид работ
            <select
              required
              value={form.workTypeId}
              onChange={(event) => setForm({ ...form, workTypeId: event.target.value })}
            >
              {workTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-fields">
            <label>
              Объем
              <input
                required
                min="0.01"
                step="0.01"
                type="number"
                value={form.volume}
                onChange={(event) => setForm({ ...form, volume: event.target.value })}
              />
            </label>

            <label>
              Ед. изм.
              <select
                required
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Исполнитель
            <input
              required
              placeholder="Иванов И.И."
              value={form.performerName}
              onChange={(event) => setForm({ ...form, performerName: event.target.value })}
            />
          </label>

          <label>
            Комментарий
            <textarea
              rows={3}
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSaving}>
            {editingId ? <Check size={18} /> : <Plus size={18} />}
            {editingId ? "Сохранить" : "Добавить"}
          </button>
        </form>

        <section className="journal">
          <div className="journal-header">
            <div>
              <p className="eyebrow">Список записей</p>
              <h2>Работы на объекте</h2>
            </div>
            <div className="filters">
              <label>
                С даты
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              <label>
                По дату
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
              >
                {sort === "desc" ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                Дата
              </button>
            </div>
          </div>

          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Вид работ</th>
                  <th>Объем</th>
                  <th>Исполнитель</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="date-cell">
                        <CalendarDays size={16} />
                        {new Intl.DateTimeFormat("ru-RU").format(new Date(log.performedAt))}
                      </span>
                    </td>
                    <td>
                      <strong>{log.workType.name}</strong>
                      {log.comment && <small>{log.comment}</small>}
                    </td>
                    <td>
                      <span className="volume-pill">
                        {log.volume} {log.unit}
                      </span>
                    </td>
                    <td>
                      <span className="performer-name">{log.performerName}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button" type="button" onClick={() => handleEdit(log)} title="Редактировать">
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button danger"
                          type="button"
                          onClick={() => setLogToDelete(log)}
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && logs.length === 0 && (
              <div className="empty-state">
                <CalendarDays size={34} />
                <p>Записей за выбранный период нет</p>
              </div>
            )}

            {isLoading && <div className="empty-state">Загрузка журнала...</div>}
          </div>
        </section>
      </section>

      {logToDelete && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Удаление записи</p>
                <h2 id="delete-title">{logToDelete.workType.name}</h2>
              </div>
              <button
                className="icon-button muted"
                type="button"
                onClick={() => setLogToDelete(null)}
                title="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
            <p className="modal-copy">
              {new Intl.DateTimeFormat("ru-RU").format(new Date(logToDelete.performedAt))} ·{" "}
              {logToDelete.volume} {logToDelete.unit} · {logToDelete.performerName}
            </p>
            <div className="modal-actions">
              <button
                className="secondary-button neutral-button"
                type="button"
                onClick={() => setLogToDelete(null)}
                disabled={isDeleting}
              >
                Отмена
              </button>
              <button className="danger-button" type="button" onClick={() => void handleDelete()} disabled={isDeleting}>
                <Trash2 size={18} />
                Удалить
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

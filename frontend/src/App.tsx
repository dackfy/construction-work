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
  const performerCount = useMemo(
    () => new Set(logs.map((log) => log.performerName.trim()).filter(Boolean)).size,
    [logs]
  );
  const latestLog = useMemo(
    () =>
      [...logs].sort(
        (first, second) => new Date(second.performedAt).getTime() - new Date(first.performedAt).getTime()
      )[0],
    [logs]
  );

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
      <section className="app-chrome" aria-label="Рабочее пространство объекта">
        <div className="chrome-status">
          <span className="live-dot" />
          <span>Объект онлайн</span>
        </div>
        <div className="chrome-tabs" aria-label="Разделы">
          <span className="chrome-tab active">Журнал</span>
          <span className="chrome-tab">Объемы</span>
          <span className="chrome-tab">Смены</span>
        </div>
        <button className="icon-button chrome-action" type="button" onClick={() => void loadData()} title="Обновить">
          <RefreshCw size={18} />
        </button>
      </section>

      <section className="hero-shell">
        <div className="title-block floating-panel">
          <p className="eyebrow">Construction OS</p>
          <h1>Журнал работ</h1>
          <p className="hero-copy">Операционный слой площадки: факты, объемы и ответственные без лишнего шума.</p>
          <div className="hero-metrics" aria-label="Ключевые показатели">
            <span>{logs.length} записей</span>
            <span>{performerCount} исполнителей</span>
            <span>{periodLabel}</span>
          </div>
        </div>

        <aside className="site-lens" aria-label="Последняя активность">
          <div className="lens-topline">
            <span className="live-dot" />
            <span>Смена синхронизирована</span>
          </div>
          <div className="lens-body">
            <p className="lens-date">
              {latestLog ? new Intl.DateTimeFormat("ru-RU").format(new Date(latestLog.performedAt)) : "Сегодня"}
            </p>
            <h2>{latestLog?.workType.name || "Работы ожидают записи"}</h2>
            <p>{latestLog?.comment || "Добавьте первую запись, чтобы увидеть последнюю активность объекта."}</p>
          </div>
          <button className="lens-refresh" type="button" onClick={() => void loadData()}>
            <RefreshCw size={16} />
            Обновить
          </button>
        </aside>
      </section>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <section className="signal-strip" aria-label="Сводка журнала">
        <div className="signal-item strong">
          <ClipboardList size={18} />
          <span>{logs.length}</span>
          <p>записей</p>
        </div>
        <div className="signal-item">
          <BriefcaseBusiness size={18} />
          <span>{workTypes.length}</span>
          <p>видов работ</p>
        </div>
        <div className="signal-item">
          <Ruler size={18} />
          <span>{periodLabel}</span>
          <p>период</p>
        </div>
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

          <div className="work-feed" aria-live="polite">
            {logs.map((log, index) => (
              <article
                className={`work-card ${index === 0 ? "work-card-featured" : ""} ${
                  index % 3 === 2 ? "work-card-slim" : ""
                }`}
                key={log.id}
              >
                <div className="work-card-main">
                  <span className="date-cell">
                    <CalendarDays size={15} />
                    {new Intl.DateTimeFormat("ru-RU").format(new Date(log.performedAt))}
                  </span>
                  <div>
                    <h3>{log.workType.name}</h3>
                    {log.comment && <p>{log.comment}</p>}
                  </div>
                </div>

                <div className="work-card-meta">
                  <span className="volume-pill">
                    {log.volume} {log.unit}
                  </span>
                  <span className="performer-name">{log.performerName}</span>
                </div>

                <div className="row-actions" aria-label="Действия с записью">
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
              </article>
            ))}

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

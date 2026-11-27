const looking = document.querySelector('[data-looking-controls]');
const reveal = looking.querySelector('[data-reveal]');
const labels = document.getElementById('art-labels');
const credit = document.querySelector('[data-art-credit]');
looking.hidden = false;
reveal.addEventListener('click', () => {
  const show = labels.hidden;
  labels.hidden = !show;
  credit.hidden = !show;
  reveal.setAttribute('aria-expanded', String(show));
  reveal.textContent = show ? 'Hide the labels' : 'Reveal the labels';
});

const minute = document.querySelector('[data-minute-controls]');
const clock = minute.querySelector('[data-timer]');
const prompt = minute.querySelector('[data-prompt]');
const toggle = minute.querySelector('[data-timer-toggle]');
const reset = minute.querySelector('[data-timer-reset]');
const prompts = [
  'Notice a color. See where else it appears.',
  'Follow the edge of a shape. See where it takes you.',
  'Look at a part of the painting you’ve passed over.'
];
const duration = 60_000;
let remaining = duration;
let deadline = 0;
let ticker = null;
minute.hidden = false;

function renderMinute() {
  const seconds = Math.ceil(remaining / 1000);
  clock.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  const stage = Math.min(2, Math.floor((duration - remaining) / 20_000));
  const message = remaining ? prompts[stage] : 'That’s a minute. What did you notice near the end?';
  if (prompt.textContent !== message) prompt.textContent = message;
  toggle.textContent = ticker !== null ? 'Pause' : remaining === duration ? 'Start' : remaining ? 'Resume' : 'Start again';
  reset.disabled = ticker === null && remaining === duration;
}

function updateMinute() {
  remaining = Math.max(0, deadline - performance.now());
  if (!remaining) stopMinute();
  renderMinute();
}

function stopMinute() {
  window.clearInterval(ticker);
  ticker = null;
}

toggle.addEventListener('click', () => {
  if (ticker !== null) {
    updateMinute();
    stopMinute();
  } else {
    if (!remaining) remaining = duration;
    deadline = performance.now() + remaining;
    ticker = window.setInterval(updateMinute, 200);
  }
  renderMinute();
});

reset.addEventListener('click', () => {
  stopMinute();
  remaining = duration;
  renderMinute();
  toggle.focus();
});
renderMinute();

const taskForm = document.querySelector('[data-small-task]');
const taskInput = taskForm.elements.task;
const stepInput = taskForm.elements.step;
const result = taskForm.querySelector('[data-task-result]');
const storageKey = 'cw-playground-next-step';
taskForm.hidden = false;

function showStep(saved) {
  taskInput.value = saved.task;
  stepInput.value = saved.step;
  result.hidden = false;
  result.textContent = 'First step: ' + saved.step;
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (typeof saved?.task === 'string' && typeof saved.step === 'string') showStep(saved);
} catch {
  // The exercise can still work when browser storage is unavailable.
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const saved = {task: taskInput.value.trim(), step: stepInput.value.trim()};
  if (!saved.task || !saved.step) {
    result.hidden = false;
    result.textContent = 'Enter a task and one small step.';
    return;
  }
  showStep(saved);
  try {
    localStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    result.textContent += ' (Shown for this visit.)';
  }
});

taskForm.querySelector('[data-task-clear]').addEventListener('click', () => {
  try { localStorage.removeItem(storageKey); } catch {}
  taskForm.reset();
  result.textContent = '';
  result.hidden = true;
  taskInput.focus();
});

const advice = document.querySelector('[data-advice]');
const cards = [...advice.querySelectorAll('[data-advice-card]')];
const next = advice.querySelector('[data-next-advice]');
const adviceStatus = advice.querySelector('[data-advice-status]');
let card = 0;
next.hidden = false;
adviceStatus.hidden = false;
next.addEventListener('click', () => {
  cards[card].hidden = true;
  cards[card].querySelector('details').open = false;
  card = (card + 1) % cards.length;
  cards[card].hidden = false;
  adviceStatus.textContent = cards[card].querySelector('.play-quote').textContent;
});

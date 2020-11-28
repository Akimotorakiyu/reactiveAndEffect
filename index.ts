function isObject(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

type ObjectKey = string | number | symbol;

let currentFn: (() => void) | null;

const targetMap = new Map<Object, Map<ObjectKey, Set<() => void>>>();

function effect(fn: () => void) {
  function runner() {
    currentFn = runner;
    fn();
    currentFn = null;
  }

  runner();
}

function track<Target extends Object>(target: Target, key: ObjectKey) {
  let keyMap = targetMap.get(target);
  if (!keyMap) {
    targetMap.set(target, (keyMap = new Map()));
  }

  let fnSet = keyMap.get(key);
  if (!fnSet) {
    keyMap.set(key, (fnSet = new Set()));
  }

  fnSet.add(currentFn!);
}

function trigger<Target extends Object>(target: Target, key: ObjectKey) {
  targetMap
    .get(target)
    ?.get(key)
    ?.forEach((fn) => {
      fn();
    });
}

function reactive<T extends Object>(target: T): T {
  const obsver = new Proxy(target, {
    get(target, key) {
      const value = Reflect.get(target, key);
      track(target, key);
      return isObject(value) ? reactive(value) : value;
    },
    set(target, key, newValue) {
      const result = Reflect.set(target, key, newValue);
      trigger(target, key);
      return result;
    },
  });

  return obsver;
}

const user = reactive({
  name: "湫",
  age: 18,
});

effect(() => {
  console.log(user.name);
});

user.name = "曗";

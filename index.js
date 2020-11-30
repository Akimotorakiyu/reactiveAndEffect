function isObject(value){
  return value !== null && typeof value === "object";
}



let currentFn;

const targetMap = new Map();

function effect(fn) {
  function runner() {
    currentFn = runner;
    fn();
    currentFn = null;
  }

  runner();
}

function track(target, key) {
  let keyMap = targetMap.get(target);
  if (!keyMap) {
    targetMap.set(target, (keyMap = new Map()));
  }

  let fnSet = keyMap.get(key);
  if (!fnSet) {
    keyMap.set(key, (fnSet = new Set()));
  }

  fnSet.add(currentFn);
}

function trigger(target, key) {
  targetMap
    .get(target)
    ?.get(key)
    ?.forEach((fn) => {
      fn();
    });
}

function reactive(target) {
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

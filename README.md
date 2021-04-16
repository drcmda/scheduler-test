<p align="center">
  <img width="400" src="https://i.imgur.com/FwFaeRp.png" />
</p>
<br />

Demo: http://undesirable-bucket.surge.sh

    yarn
    yarn start

# ⚠️

It depends on `react@experimental`, `react-reconciler@experimental` and `scheduler@experimental`, all three are _highly experimental_, as the tag suggests.

# Explanation

This project creates a highly taxing environment for [react-three-fiber](https://github.com/pmndrs/react-three-fiber) and the [react scheduler](https://www.youtube.com/watch?v=nLF0n9SACd4).

It simulates heavy load by creating hundreds of THREE.TextGeometry instances (510 to be exact). This class, like many others in Threejs, is expensive and takes a while to construct. If all 510 instances are created the same time it will cause 1085.77685546875ms of pure jank (Apple M1), the tab would normally freeze.

You can try it yourself, here is a framework-independent stress-test that does exactly what this project is doing:

```jsx
async function test() {
  const chars = `!"§$%&/()=?*#<>-_.:,;+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;
  const font = await new Promise((res) => new THREE.FontLoader().load("/Inter UI_Bold.json", res));
  console.time("test");
  for (let i = 0; i < 510; i++) {
    new THREE.TextGeometry(chars[Math.floor(Math.random() * chars.length)], {
      font,
      size: 1,
      height: 0.5,
      curveSegments: 80,
      bevelEnabled: false,
    });
  }
  console.timeEnd("test");
}
test();
```

There is no chance that Threejs or any application or framework for that matter can take that amount of load on a single thread (you can ~16ms per frame for calculations max).

# Expectation

Reacts task here is to balance that load so that a stable 60 frames/second can _always_ be maintained. **510 instances will be re-created every 2 seconds.**

There are two modes:

- Distributed: the app will randomly spread the creation of all instances over a second, by the end of which all instances will be created. This simulates ongoing stress,
- At-once (distributed is off): all instances will be created at once, which is the worst case scenario.

### Observations and stats (Apple M1)

Plain Threejs is simulated when `concurrent` is off, otherwise React will run in concurrent mode.

|         | Distributed | At-once |
| ------- | ----------- | ------- |
| Threejs | ~10fps      | ~5fps   |
| React   | ~60fps      | ~60fps  |

<p align="center">
<img src="/assets/three-distributed.jpg"><img src="/assets/three-at-once.jpg">
<img src="/assets/react-distributed.jpg"><img src="/assets/react-at-once.jpg">
</p>

### How?

React can do this because of concurrent-mode, which is React-futures new scheduler. Think of how a virtual list schedules its items, no matter if you give it 10 or 10.000.000, it will render only as much as the screen can take. But React does this at the system level, _every_ operation is weighed. If operations would start to bite into the framerate React must balance them.

### Can this be done without React?

To get anything even remotely similar in user-land would be an endevour to say the least. This is not just simple requestIdleFrame and defer, think of the repercussions: mount/unmount race conditions, async ops, everything must still function.

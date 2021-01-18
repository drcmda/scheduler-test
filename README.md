<p align="center">
  <img width="400" src="https://i.imgur.com/FwFaeRp.png" />
</p>
<br />

Demo: http://undesirable-bucket.surge.sh

    yarn
    yarn start

# ⚠️

It depends on `react@experimental`, `react-reconciler@experimental` and `scheduler@experimental`, all three are *highly experimental*, as the tag suggests.

# Explanation

This project creates a highly taxing environment for [react-three-fiber](https://github.com/pmndrs/react-three-fiber) and the [react scheduler](https://www.youtube.com/watch?v=nLF0n9SACd4) in concurrent mode.

### High priority

It creates a higher prioritized spinning ball of boxgeometry. It is expected that it spins smoothly overall.

### Low priority

It also creates a lower prioritized cluster of colored blocks that simulate heavy load. Each block delays the render function, thereby blocking the main thread. The potential load, all blocks considered, is 600ms. The blocks will go through that every 2 seconds. It is expected that the blocks change color, but they should not be dragging down the framerate.

### Expectations

The scheduler has to keep a stable framerate first and foremost. And it should be able to discern between important updates and updates that are of lesser importance. It also has to take the environment into account, since threejs runs on the same thread.

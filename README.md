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

This project creates a slightly taxing environment for the [react scheduler](https://www.youtube.com/watch?v=nLF0n9SACd4) in concurrent mode.

### High priority

It creates a higher prioritized spinning ball of boxgeometry. It is expected that it spins smoothly overall.

### Low priority

It also creates a lower prioritized cluster of colored blocks that simulate load. Each block throws a delay into the render function, thereby blocking it. The potential total load per frame can be up to 600ms (unscheduled). In an interval each block will change state (the color), which again will hit the delay. The slowdown is mandatory, it would make the test pointless without it. It simulates components that have heavy setup phases. 

It is expected that the blocks change color, but they should not be dragging down the framerate.

### Expectations

The scheduler has to keep a stable framerate first and foremost. And it should be able to discern between important updates and updates that are of lesser importance. It also has to take the environment into account, since threejs runs on the same thread.

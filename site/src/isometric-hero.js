    (() => {
      // Place each background object by its ground footprint, keeping road shoulders clear.
      const city = document.querySelector('#background-city');
      if (!city) return;
      const roads = [
        [-250,195,900,860],[-250,423,490,850],[104,-60,1500,746],
        [390,-60,1500,582],[-250,665,900,-4],[0,856,1300,105],[280,895,1400,247]
      ];
      const landmarks = [[542,113,130,76],[992,375,120,70],[772,240,120,70],
        [444,510,115,68],[770,697,115,68],[755,517,120,70]];
      const types = [
        {id:'urban-midrise', x:48, y:92, scale:.66, radius:34},
        {id:'urban-office', x:41, y:120, scale:.69, radius:29},
        {id:'urban-stepped', x:43, y:90, scale:.68, radius:31},
        {id:'neighbour-courtyard', x:41, y:66, scale:.72, radius:32},
        {id:'neighbour-glass', x:31, y:58, scale:.82, radius:28},
        {id:'building-tower', x:46, y:145, scale:.64, radius:32},
        {id:'urban-midrise', x:48, y:92, scale:.58, radius:30},
        {id:'neighbour-shop', x:38, y:38, scale:.68, radius:28},
        {id:'neighbour-garden', x:63, y:36, scale:.55, radius:38},
        {id:'street-tree', x:0, y:2, scale:.9, radius:12}
      ];
      const distanceToRoad = (x,y,[x1,y1,x2,y2]) => {
        const dx=x2-x1, dy=y2-y1;
        const t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)));
        return Math.hypot(x-(x1+t*dx),y-(y1+t*dy));
      };
      const occupied = [];
      const objects = [];
      for (let row=-2; row<38; row++) {
        for (let col=-4; col<36; col++) {
          const hash = Math.abs((row*73856093 ^ col*19349663) >>> 0);
          const type = types[hash % types.length];
          const x=col*42+(row%2)*21+(hash%7-3);
          const y=row*24+((hash>>>4)%7-3);
          if (x < -215 || x > 1230 || y < -35 || y > 870) continue;
          if (roads.some(road => distanceToRoad(x,y,road) < 24+type.radius+3)) continue;
          if (landmarks.some(([cx,cy,rx,ry]) => Math.abs(x-cx)/(rx+type.radius)+Math.abs(y-cy)/(ry+type.radius)<1)) continue;
          if (occupied.some(other => Math.hypot(x-other.x,(y-other.y)*1.6) < type.radius+other.radius+3)) continue;
          occupied.push({x,y,radius:type.radius});
          objects.push({x,y,type});
        }
      }
      objects.sort((a,b) => a.y-b.y).forEach(({x,y,type}) => {
        const item=document.createElementNS('http://www.w3.org/2000/svg','use');
        item.setAttribute('href',`#${type.id}`);
        item.setAttribute('transform',`translate(${(x-type.x*type.scale).toFixed(1)} ${(y-type.y*type.scale).toFixed(1)}) scale(${type.scale})`);
        city.appendChild(item);
      });
      const modules = [...document.querySelectorAll('.module')];
      const name = document.querySelector('#module-name');
      const text = document.querySelector('#module-text');
      const type = document.querySelector('#module-type');
      const callout = document.querySelector('.callout');
      const scene = document.querySelector('.scene-card');
      let activeModule = null;
      function placeCallout(module) {
        const object = module.getBoundingClientRect();
        const bounds = scene.getBoundingClientRect();
        const gap = 12;
        const cardWidth = callout.offsetWidth;
        const cardHeight = callout.offsetHeight;
        const canPlaceRight = object.right + cardWidth + gap <= bounds.right - 8;
        let left = canPlaceRight
          ? object.right - bounds.left + gap
          : object.left - bounds.left - cardWidth - gap;
        let top = object.top - bounds.top + (object.height - cardHeight) / 2;
        if (top < 12) top = object.bottom - bounds.top + gap;
        if (top + cardHeight > bounds.height - 12) top = object.top - bounds.top - cardHeight - gap;
        left = Math.max(12, Math.min(left, bounds.width - cardWidth - 12));
        top = Math.max(12, Math.min(top, bounds.height - cardHeight - 12));
        callout.style.left = `${left}px`;
        callout.style.top = `${top}px`;
      }
      function show(module) {
        modules.forEach(item => item.classList.toggle('is-active', item === module));
        activeModule = module;
        name.textContent = module.dataset.name;
        text.textContent = module.dataset.description;
        type.textContent = module.dataset.type;
        placeCallout(module);
        callout.classList.add('is-visible');
      }
      function hide() { activeModule = null; modules.forEach(item => item.classList.remove('is-active')); callout.classList.remove('is-visible'); }
      modules.forEach(module => {
        module.addEventListener('mouseenter', () => show(module));
        module.addEventListener('mouseleave', hide);
      });
      window.addEventListener('resize', () => { if (activeModule) placeCallout(activeModule); });
    })();

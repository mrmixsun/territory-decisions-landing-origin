// Origin / 01.1 / 27:5. Figma assets stay external local files.
export function originHero(asset) {
  const img = (name, cls, style = '') => `<img class="${cls}" src="${asset('origin-' + name)}" alt="" ${style ? 'style="' + style + '"' : ''}>`;
  return `<div class="origin-hero-art" aria-hidden="true"><div class="origin-hero-scene" data-scale-width="1193">
    <div class="origin-city">${img('img2.png', 'origin-city-image')}</div>
    ${img('imgVector5.svg', 'origin-route origin-route--one')}
    ${img('imgVector6.svg', 'origin-route origin-route--two')}
    <div class="origin-widget origin-widget--project">${img('imgImage6.png', 'origin-widget-image')}</div>
    <div class="origin-widget origin-widget--population">${img('imgImage6.png', 'origin-widget-image')}</div>
    <div class="origin-widget origin-widget--investment">${img('imgImage6.png', 'origin-widget-image')}</div>
    ${img('imgGroup2.svg', 'origin-marker origin-marker--left')}
    ${img('imgGroup3.svg', 'origin-marker origin-marker--middle')}
    ${img('imgGroup4.svg', 'origin-marker origin-marker--right')}
  </div></div>`;
}

export function originDiagram(asset) {
  const img = (name, x, y, extra = '') => `<img src="${asset('origin-' + name + '.svg')}" alt="" style="left:${x}px;top:${y}px;${extra}">`;
  const top = ['Исходные<br>сведения','Рабочие<br>инструменты','Комплект<br>документов','Процедуры<br>и акт'];
  return `<div class="origin-diagram" role="img" aria-label="Как решение проходит путь сейчас: исходные сведения, рабочие инструменты, комплект документов, процедуры и акт. Затем ручной перенос в систему A, систему B и реестр. Следующая задача — новая выгрузка и новая проверка."><div class="origin-diagram-scene" data-scale-width="719">
    <strong class="origin-diagram-title">КАК РЕШЕНИЕ ПРОХОДИТ ПУТЬ СЕЙЧАС</strong>
    ${top.map((t,i)=>`<div class="origin-diagram-node" style="left:${34.89+173.65*i}px;top:77.8px"><span>0${i+1}</span><div>${t}</div></div>`).join('')}
    ${['Система A','Система B','Реестр'].map((t,i)=>`<div class="origin-diagram-node origin-diagram-node--copy" style="left:${[118.55,319.33,526.86][i]}px;top:226.52px"><div>${t}</div><span>${i===2?'свои поля':'своя копия'}</span></div>`).join('')}
    ${img('imgGroup14',151,112.4)}${img('imgGroup14',325.4,112.4)}${img('imgGroup16',193,112.4)}
    ${img('imgEllipse7',389.14,221.83)}${img('imgEllipse7',188.35,221.83)}${img('imgEllipse7',611.16,221.83)}${img('imgEllipse5',611.97,150.92)}
    <span class="origin-transfer">РУЧНОЙ ПЕРЕНОС</span>
    ${[193,394,616].map(x=>img('imgVector7',x,216,'transform:rotate(90deg)')).join('')}
    <div class="origin-diagram-result"><div><strong>СЛЕДУЮЩАЯ ЗАДАЧА</strong><p>Новая выгрузка — новая проверка</p></div>${img('imgFrame49',585,15)}</div>
  </div></div><picture class="origin-diagram-mobile"><img src="${asset('story-current-process-mobile.svg')}" alt="Исходные сведения и рабочие инструменты, комплект документов, процедуры и акт, ручной перенос в системы A и B и реестр. Следующая задача — новая выгрузка и новая проверка." loading="lazy"></picture>`;
}

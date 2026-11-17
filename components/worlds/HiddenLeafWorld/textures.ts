import * as THREE from "three";
import { seededRandom } from "./config";

function createCanvasTexture(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D, random: () => number) => void,
  repeatX = 1,
  repeatY = 1
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (context) {
    draw(context, seededRandom(0x51a7c0de));
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 4;

  return texture;
}

/** Stone paving used by the main village approach. */
export function createPavingTexture(repeatX = 1, repeatY = 16) {
  return createCanvasTexture(
    256,
    256,
    (context) => {
      context.fillStyle = "#8a7d69";
      context.fillRect(0, 0, 256, 256);

      const rows = 8;
      const rowHeight = 256 / rows;
      for (let row = 0; row < rows; row += 1) {
        const offset = row % 2 === 0 ? 0 : 32;
        for (let column = -1; column < 5; column += 1) {
          const x = column * 64 + offset + 2;
          const y = row * rowHeight + 2;
          const shade = 0.86 + ((row * 7 + column * 13) % 5) * 0.035;
          context.fillStyle = `rgba(${Math.round(132 * shade)}, ${Math.round(
            119 * shade
          )}, ${Math.round(99 * shade)}, 1)`;
          context.fillRect(x, y, 60, rowHeight - 4);
        }
      }

      context.strokeStyle = "rgba(52, 46, 38, 0.4)";
      context.lineWidth = 2;
      for (let row = 0; row <= rows; row += 1) {
        context.beginPath();
        context.moveTo(0, row * rowHeight);
        context.lineTo(256, row * rowHeight);
        context.stroke();
      }
    },
    repeatX,
    repeatY
  );
}

/** Mottled earth used to break up the large terrain plane. */
export function createGroundTexture() {
  return createCanvasTexture(
    256,
    256,
    (context, random) => {
      context.fillStyle = "#f0eee6";
      context.fillRect(0, 0, 256, 256);

      for (let index = 0; index < 900; index += 1) {
        const x = random() * 256;
        const y = random() * 256;
        const radius = 0.6 + random() * 2.6;
        const alpha = 0.04 + random() * 0.09;
        context.fillStyle =
          random() > 0.45
            ? `rgba(120, 118, 96, ${alpha})`
            : `rgba(255, 252, 236, ${alpha})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = 0; index < 22; index += 1) {
        const x = random() * 256;
        const y = random() * 256;
        context.strokeStyle = "rgba(96, 102, 74, 0.06)";
        context.lineWidth = 1 + random() * 2;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + (random() - 0.5) * 60, y + 20 + random() * 60);
        context.stroke();
      }
    },
    70,
    70
  );
}

/** Staggered roof tiles; tinted per-house by instance colour. */
export function createRoofTexture() {
  return createCanvasTexture(
    128,
    128,
    (context, random) => {
      context.fillStyle = "#dcdcdc";
      context.fillRect(0, 0, 128, 128);

      const rowHeight = 16;
      for (let row = 0; row < 8; row += 1) {
        const y = row * rowHeight;
        context.fillStyle = "rgba(255, 255, 255, 0.34)";
        context.fillRect(0, y + 1, 128, 3);
        context.fillStyle = "rgba(72, 72, 72, 0.42)";
        context.fillRect(0, y + rowHeight - 4, 128, 4);

        const offset = row % 2 === 0 ? 0 : 14;
        for (let column = 0; column < 9; column += 1) {
          const x = column * 28 + offset;
          context.fillStyle = `rgba(90, 90, 90, ${0.18 + random() * 0.12})`;
          context.fillRect(x, y + 3, 2, rowHeight - 7);
        }
      }
    },
    3,
    2
  );
}

/** Subtle plaster mottling for the house and tower walls. */
export function createPlasterTexture() {
  return createCanvasTexture(
    128,
    128,
    (context, random) => {
      context.fillStyle = "#f4efe4";
      context.fillRect(0, 0, 128, 128);

      for (let index = 0; index < 420; index += 1) {
        const x = random() * 128;
        const y = random() * 128;
        context.fillStyle =
          random() > 0.5
            ? `rgba(196, 184, 160, ${0.04 + random() * 0.08})`
            : `rgba(255, 253, 245, ${0.05 + random() * 0.1})`;
        context.beginPath();
        context.arc(x, y, 0.8 + random() * 3.4, 0, Math.PI * 2);
        context.fill();
      }

      context.strokeStyle = "rgba(150, 136, 112, 0.1)";
      context.lineWidth = 1;
      for (let index = 0; index < 6; index += 1) {
        const x = 12 + random() * 104;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x + (random() - 0.5) * 10, 128);
        context.stroke();
      }
    },
    2,
    2
  );
}

/** Warm paper shoji with a dark timber lattice, used as map + emissive map. */
export function createShojiTexture() {
  return createCanvasTexture(128, 128, (context) => {
    const gradient = context.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, "#ffe0b4");
    gradient.addColorStop(0.55, "#ffc383");
    gradient.addColorStop(1, "#f2a75c");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    context.fillStyle = "rgba(96, 58, 30, 0.16)";
    context.fillRect(0, 0, 128, 10);

    context.fillStyle = "rgba(46, 28, 16, 0.86)";
    for (let index = 1; index < 4; index += 1) {
      context.fillRect((index * 128) / 4 - 2, 0, 4, 128);
      context.fillRect(0, (index * 128) / 4 - 2, 128, 4);
    }

    context.strokeStyle = "rgba(38, 23, 13, 0.9)";
    context.lineWidth = 8;
    context.strokeRect(2, 2, 124, 124);
  });
}

/** Cool glass for unlit windows. */
export function createDarkWindowTexture() {
  return createCanvasTexture(128, 128, (context) => {
    const gradient = context.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, "#1d2a38");
    gradient.addColorStop(0.45, "#141d28");
    gradient.addColorStop(1, "#0e151d");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    context.fillStyle = "rgba(150, 186, 214, 0.16)";
    context.beginPath();
    context.moveTo(0, 92);
    context.lineTo(128, 18);
    context.lineTo(128, 42);
    context.lineTo(0, 116);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(9, 14, 19, 0.85)";
    for (let index = 1; index < 3; index += 1) {
      context.fillRect((index * 128) / 3 - 2, 0, 4, 128);
      context.fillRect(0, (index * 128) / 3 - 2, 128, 4);
    }

    context.strokeStyle = "rgba(8, 12, 16, 0.95)";
    context.lineWidth = 9;
    context.strokeRect(2, 2, 124, 124);
  });
}

/** Striped fabric awning above shopfronts. */
export function createAwningTexture() {
  return createCanvasTexture(
    128,
    128,
    (context) => {
      context.fillStyle = "#ded1b4";
      context.fillRect(0, 0, 128, 128);

      for (let x = 0; x < 128; x += 40) {
        context.fillStyle = "#8a332a";
        context.fillRect(x + 12, 0, 20, 128);
      }

      const shade = context.createLinearGradient(0, 0, 0, 128);
      shade.addColorStop(0, "rgba(30, 18, 12, 0.24)");
      shade.addColorStop(0.4, "rgba(30, 18, 12, 0)");
      shade.addColorStop(1, "rgba(30, 18, 12, 0.18)");
      context.fillStyle = shade;
      context.fillRect(0, 0, 128, 128);
    },
    2,
    1
  );
}

/** Indigo noren curtain with a cream crest. */
export function createNorenTexture() {
  return createCanvasTexture(128, 160, (context) => {
    context.fillStyle = "#2b3a52";
    context.fillRect(0, 0, 128, 160);

    context.fillStyle = "#e4d7bd";
    context.fillRect(0, 0, 128, 20);

    context.strokeStyle = "rgba(228, 215, 189, 0.82)";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(64, 82, 27, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(64, 82, 12, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "rgba(12, 18, 28, 0.6)";
    for (let x = 0; x < 128; x += 6) {
      context.fillRect(x, 0, 2, 160);
    }

    context.fillStyle = "rgba(10, 16, 24, 0.8)";
    context.fillRect(42, 96, 4, 64);
    context.fillRect(84, 96, 4, 64);
  });
}

/** Planked timber door with an iron pull. */
export function createDoorTexture() {
  return createCanvasTexture(128, 256, (context) => {
    context.fillStyle = "#2b1e15";
    context.fillRect(0, 0, 128, 256);

    for (let x = 0; x < 128; x += 21) {
      context.fillStyle = "rgba(90, 66, 44, 0.3)";
      context.fillRect(x, 0, 2, 256);
      context.fillStyle = "rgba(18, 12, 8, 0.45)";
      context.fillRect(x + 18, 0, 2, 256);
    }

    context.fillStyle = "rgba(201, 163, 95, 0.55)";
    context.beginPath();
    context.arc(98, 132, 6, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(76, 52, 34, 0.9)";
    context.lineWidth = 10;
    context.strokeRect(3, 3, 122, 250);
  });
}

/** Warm red banner with a cream fire glyph, used on the Hokage building. */
export function createBannerTexture() {
  return createCanvasTexture(128, 384, (context) => {
    context.fillStyle = "#7c2f27";
    context.fillRect(0, 0, 128, 384);

    context.strokeStyle = "rgba(232, 203, 149, 0.6)";
    context.lineWidth = 3;
    context.strokeRect(8, 8, 112, 368);

    context.fillStyle = "#e8cb95";
    context.font = "bold 190px 'Yu Mincho', 'Noto Serif JP', serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("火", 64, 196);
  });
}

/** Horizontal Hokage sign board. */
export function createSignTexture() {
  return createCanvasTexture(384, 160, (context) => {
    context.fillStyle = "#7c2f27";
    context.fillRect(0, 0, 384, 160);

    context.strokeStyle = "rgba(232, 203, 149, 0.75)";
    context.lineWidth = 5;
    context.strokeRect(10, 10, 364, 140);

    context.fillStyle = "#e8cb95";
    context.font = "bold 116px 'Yu Mincho', 'Noto Serif JP', serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("火", 192, 86);
  });
}

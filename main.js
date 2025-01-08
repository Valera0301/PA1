'use strict';

let gl;
let surface;
let shProgram;
let spaceball;

// Функція для перетворення градусів у радіани
function deg2rad(angle) {
    return angle * Math.PI / 180;
}

// Конструктор для класу Model (Модель)
function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer(); // Створення буфера для зберігання вершин
    this.count = 0; // Лічильник вершин

    // Метод для запису даних в буфер
    this.BufferData = function(vertices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);
        this.count = vertices.length / 3; // Обчислення кількості вершин (кожна вершина має 3 координати)
    }

    // Метод для малювання моделі
    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);
        gl.drawArrays(gl.LINE_STRIP, 0, this.count); // Малюємо лінії між точками
    }
}

// Конструктор для класу ShaderProgram (Шейдерна програма)
function ShaderProgram(name, program) {
    this.name = name;
    this.prog = program;

    // Локації атрибутів та юніформів у шейдері
    this.iAttribVertex = -1; // Локація атрибуту для вершин
    this.iColor = -1; // Локація для кольору примітиву
    this.iModelViewProjectionMatrix = -1; // Локація для матриці трансформацій

    // Метод для активації шейдерної програми
    this.Use = function() {
        gl.useProgram(this.prog);
    }
}

// Функція для створення даних поверхні Неовія
// Спочатку будується верхня півсфера, потім нижня
function CreateNeoviusSurfaceData() {
    const vertexList = [];
    const step = 0.3; // Крок для точності побудови
    const range = Math.PI; // Діапазон для параметрів u та v (від -π до π)

    // Генерація точок для верхньої півсфери (позитивний z)
    for (let u = -range; u <= range; u += step) {
        for (let v = -range; v <= range; v += step) {
            const x = u;
            const y = v;

            // Обчислення виразу для cos в функції acos
            const cosValue = (-3*(Math.cos(u) + Math.cos(v))) / (3 + 4 * Math.cos(u) * Math.cos(v));
            
            // Обмежуємо значення косинуса для забезпечення коректного значення acos
            const clampedCosValue = Math.max(-1, Math.min(1, cosValue));

            // Обчислюємо координату z для верхньої півсфери
            const z1 = Math.acos(clampedCosValue);

            // Додаємо точку верхньої півсфери
            vertexList.push(x, y, z1);

            // Малюємо лінії в напрямку u для верхньої півсфери
            if (u + step <= range) {
                const x2 = u + step;
                const y2 = v;
                const cosValue2 = (-3*(Math.cos(x2) + Math.cos(y2))) / (3 + 4 * Math.cos(x2) * Math.cos(y2));
                const clampedCosValue2 = Math.max(-1, Math.min(1, cosValue2));
                const z2_1 = Math.acos(clampedCosValue2); // Верхня півсфера
                vertexList.push(x2, y2, z2_1);
            }

            // Малюємо лінії в напрямку v для верхньої півсфери
            if (v + step <= range) {
                const x3 = u;
                const y3 = v + step;
                const cosValue3 = (-3 *(Math.cos(x3) + Math.cos(y3))) / (3 + 4 * Math.cos(x3) * Math.cos(y3));
                const clampedCosValue3 = Math.max(-1, Math.min(1, cosValue3));
                const z3_1 = Math.acos(clampedCosValue3); // Верхня півсфера
                vertexList.push(x3, y3, z3_1);
            }
        }
    }
    
    // Генерація точок для нижньої півсфери (негативний z)
    const lowerHemisphere = [];
    for (let u = -range; u <= range; u += step) {
        for (let v = -range; v <= range; v += step) {
            const x = u;
            const y = v;

            // Обчислення виразу для cos в функції acos
            const cosValue = (-3 * Math.cos(u) + -3 * Math.cos(v)) / (3 + 4 * Math.cos(u) * Math.cos(v));
            
            // Обмежуємо значення косинуса для забезпечення коректного значення acos
            const clampedCosValue = Math.max(-1, Math.min(1, cosValue));

            // Обчислюємо координату z для нижньої півсфери
            const z2 = -Math.acos(clampedCosValue);

            // Додаємо точку нижньої півсфери
            lowerHemisphere.push(x, y, z2);

            // Малюємо лінії в напрямку u для нижньої півсфери
            if (u + step <= range) {
                const x2 = u + step;
                const y2 = v;
                const cosValue2 = (-3 * Math.cos(x2) + -3 * Math.cos(y2)) / (3 + 4 * Math.cos(x2) * Math.cos(y2));
                const clampedCosValue2 = Math.max(-1, Math.min(1, cosValue2));
                const z2_2 = -Math.acos(clampedCosValue2); // Нижня півсфера
                lowerHemisphere.push(x2, y2, z2_2);
            }

            // Малюємо лінії в напрямку v для нижньої півсфери
            if (v + step <= range) {
                const x3 = u;
                const y3 = v + step;
                const cosValue3 = (-3 * Math.cos(x3) + -3 * Math.cos(y3)) / (3 + 4 * Math.cos(x3) * Math.cos(y3));
                const clampedCosValue3 = Math.max(-1, Math.min(1, cosValue3));
                const z3_2 = -Math.acos(clampedCosValue3); // Нижня півсфера
                lowerHemisphere.push(x3, y3, z3_2);
            }
        }
    }

    // Об'єднуємо обидві півсфери в один список вершин
    return vertexList.concat(lowerHemisphere);
}

// Функція для ініціалізації контексту WebGL та шейдерної програми
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    // Одержуємо локації атрибутів та юніформів
    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iColor = gl.getUniformLocation(prog, "color");

    surface = new Model('Neovius Surface');
    surface.BufferData(CreateNeoviusSurfaceData());

    gl.enable(gl.DEPTH_TEST); // Увімкнення тесту глибини для коректного відображення поверхні
}

// Функція для створення шейдерної програми
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}

// Головна функція для малювання
function draw() {
    gl.clearColor(0, 0, 0, 1); // Встановлюємо колір фону
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projection = m4.perspective(Math.PI / 8, 1, 8, 12);
    let modelView = spaceball.getViewMatrix();

    // Трансформації для моделі
    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    let modelViewProjection = m4.multiply(projection, matAccum1);

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);

    gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]); // Встановлення кольору для малювання

    surface.Draw();
}

// Ініціалізація при завантаженні сторінки
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0); // Ініціалізація обертання сцени

    draw();
}

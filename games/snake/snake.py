import asyncio
import random
from array import array
from dataclasses import dataclass
from math import pi, sin
from typing import Final

import pygame

GridPos = tuple[int, int]

UP: Final[GridPos] = (0, -1)
DOWN: Final[GridPos] = (0, 1)
LEFT: Final[GridPos] = (-1, 0)
RIGHT: Final[GridPos] = (1, 0)


@dataclass(frozen=True)
class Settings:
    '''Configuration immutable du jeu Snake.'''

    cell_size: int = 24
    grid_width: int = 24
    grid_height: int = 18
    base_speed: float = 8.0
    speed_step: float = 0.25
    max_speed: float = 16.0
    fps: int = 60

    bg_color: tuple[int, int, int] = (10, 14, 20)
    grid_color: tuple[int, int, int] = (20, 30, 45)
    snake_color: tuple[int, int, int] = (110, 231, 183)
    snake_head_color: tuple[int, int, int] = (125, 211, 252)
    apple_color: tuple[int, int, int] = (248, 113, 113)
    text_color: tuple[int, int, int] = (226, 232, 240)

    @property
    def screen_width(self) -> int:
        return self.grid_width * self.cell_size

    @property
    def screen_height(self) -> int:
        return self.grid_height * self.cell_size


@dataclass
class GameState:
    '''Etat runtime du jeu.'''

    running: bool = True
    started: bool = False
    paused: bool = False
    game_over: bool = False
    score: int = 0


class SnakeModel:
    '''Modele de deplacement et collisions de Snake, independant du rendu.'''

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self.segments: list[GridPos] = []
        self.direction: GridPos = RIGHT
        self.queued_direction: GridPos = RIGHT
        self.reset()

    def reset(self) -> None:
        '''Reinitialise la position du snake au centre de la grille.'''
        cx = self._settings.grid_width // 2
        cy = self._settings.grid_height // 2
        self.segments = [(cx, cy), (cx - 1, cy), (cx - 2, cy)]
        self.direction = RIGHT
        self.queued_direction = RIGHT

    def queue_direction(self, new_direction: GridPos) -> None:
        '''Empile une direction valide en bloquant le demi-tour instantane.'''
        if self.direction[0] == -new_direction[0] and self.direction[1] == -new_direction[1]:
            return
        self.queued_direction = new_direction

    def compute_next_head(self) -> GridPos:
        head_x, head_y = self.segments[0]
        dx, dy = self.queued_direction
        return head_x + dx, head_y + dy

    def apply_step(self, next_head: GridPos, grow: bool) -> None:
        self.direction = self.queued_direction
        self.segments.insert(0, next_head)
        if not grow:
            self.segments.pop()

    def collides_with_self(self, next_head: GridPos) -> bool:
        return next_head in self.segments


class SnakeGame:
    '''Orchestre l'input, la logique, et le rendu de Snake via Pygame.

    Cette classe reproduit la logique de la version JS: collision contre les murs,
    score progressif, vitesse dynamique, pause/restart.
    '''

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.state = GameState()
        self.snake = SnakeModel(settings)
        self.apple: GridPos = (0, 0)
        self._rng = random.Random()

        self._screen: pygame.Surface | None = None
        self._font: pygame.font.Font | None = None
        self._clock: pygame.time.Clock | None = None
        self._last_move_ms: int = 0
        self._interp_alpha: float = 1.0
        self._previous_segments: list[GridPos] = []
        self._eat_sound: pygame.mixer.Sound | None = None

        self.reset_round()

    def setup(self) -> None:
        pygame.init()
        self._setup_audio()
        self._screen = pygame.display.set_mode((self.settings.screen_width, self.settings.screen_height))
        pygame.display.set_caption("Snake")
        self._font = pygame.font.SysFont("SF Pro Display", 18)
        self._clock = pygame.time.Clock()
        self._last_move_ms = pygame.time.get_ticks()

    def reset_round(self) -> None:
        '''Reinitialise une partie sans quitter l'application.'''
        self.state = GameState()
        self.snake.reset()
        self._previous_segments = list(self.snake.segments)
        self._interp_alpha = 1.0
        self.apple = self._spawn_apple()

    def _setup_audio(self) -> None:
        '''Initialise le mixer et prepare le son de consommation.

        Sous certains navigateurs/WebAssembly, l'audio peut etre restreint; on garde
        un fallback silencieux si le mixer n'est pas disponible.
        '''
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init(frequency=44100, size=-16, channels=1)
            self._eat_sound = self._build_tone_sound(660, 0.06, 0.24)
        except pygame.error:
            self._eat_sound = None

    def _build_tone_sound(self, frequency: float, duration_s: float, volume: float) -> pygame.mixer.Sound:
        sample_rate = 44100
        total_samples = int(sample_rate * duration_s)
        max_amp = int(32767 * max(0.0, min(volume, 1.0)))

        samples = array("h")
        for i in range(total_samples):
            t = i / sample_rate
            # Envelope courte pour eviter les clics et donner un effet arcade propre.
            envelope = max(0.0, 1.0 - (t / duration_s)) ** 2
            value = int(max_amp * envelope * sin(2 * pi * frequency * t))
            samples.append(value)

        return pygame.mixer.Sound(buffer=samples.tobytes())

    def _play_eat_sound(self) -> None:
        if self._eat_sound is None:
            return
        try:
            self._eat_sound.play()
        except pygame.error:
            pass

    def _spawn_apple(self) -> GridPos:
        '''Genere une pomme sur une case libre de la grille.

        Le placement est relance tant que la case est occupee par le snake.
        '''
        occupied = set(self.snake.segments)
        while True:
            position = (
                self._rng.randint(0, self.settings.grid_width - 1),
                self._rng.randint(0, self.settings.grid_height - 1),
            )
            if position not in occupied:
                return position

    def _current_speed(self) -> float:
        return min(self.settings.max_speed, self.settings.base_speed + self.state.score * self.settings.speed_step)

    def _move_interval_ms(self) -> float:
        return 1000.0 / self._current_speed()

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.QUIT:
            self.state.running = False
            return

        if event.type != pygame.KEYDOWN:
            return

        if event.key == pygame.K_ESCAPE:
            self.state.running = False
        elif event.key == pygame.K_SPACE:
            if self.state.game_over:
                self.reset_round()
            else:
                self.state.started = True
                self.state.paused = not self.state.paused
        elif event.key == pygame.K_r:
            self.reset_round()
        elif event.key in (pygame.K_UP, pygame.K_w):
            self.snake.queue_direction(UP)
        elif event.key in (pygame.K_DOWN, pygame.K_s):
            self.snake.queue_direction(DOWN)
        elif event.key in (pygame.K_LEFT, pygame.K_a):
            self.snake.queue_direction(LEFT)
        elif event.key in (pygame.K_RIGHT, pygame.K_d):
            self.snake.queue_direction(RIGHT)

    def update(self, now_ms: int) -> None:
        interval_ms = self._move_interval_ms()
        elapsed = now_ms - self._last_move_ms
        self._interp_alpha = min(1.0, max(0.0, elapsed / interval_ms))

        if not self.state.started or self.state.paused or self.state.game_over:
            self._interp_alpha = 1.0
            return
        if elapsed < interval_ms:
            return

        self._previous_segments = list(self.snake.segments)
        self._last_move_ms = now_ms
        next_head = self.snake.compute_next_head()
        nx, ny = next_head

        hit_wall = nx < 0 or nx >= self.settings.grid_width or ny < 0 or ny >= self.settings.grid_height
        if hit_wall or self.snake.collides_with_self(next_head):
            self.state.game_over = True
            self.state.paused = False
            return

        did_eat = next_head == self.apple
        self.snake.apply_step(next_head, grow=did_eat)
        if did_eat:
            self.state.score += 1
            self.apple = self._spawn_apple()
            self._play_eat_sound()

    @staticmethod
    def _lerp(start: float, end: float, alpha: float) -> float:
        return start + (end - start) * alpha

    def _previous_segment_for_index(self, index: int) -> GridPos:
        '''Retourne la position precedente d'un segment pour interpolation.

        Apres un pas de simulation, chaque segment i vient de i-1, tandis que la tete
        vient de l'ancienne tete. En cas de croissance, le dernier segment conserve
        sa position precedente.
        '''
        if not self._previous_segments:
            return self.snake.segments[index]
        if index == 0:
            return self._previous_segments[0]
        previous_index = min(index - 1, len(self._previous_segments) - 1)
        return self._previous_segments[previous_index]

    def draw(self) -> None:
        if self._screen is None or self._font is None:
            return

        self._screen.fill(self.settings.bg_color)
        self._draw_grid(self._screen)
        self._draw_apple(self._screen)
        self._draw_snake(self._screen)
        self._draw_hud(self._screen, self._font)
        pygame.display.flip()

    def _draw_grid(self, surface: pygame.Surface) -> None:
        for x in range(self.settings.grid_width + 1):
            pygame.draw.line(
                surface,
                self.settings.grid_color,
                (x * self.settings.cell_size, 0),
                (x * self.settings.cell_size, self.settings.screen_height),
                1,
            )
        for y in range(self.settings.grid_height + 1):
            pygame.draw.line(
                surface,
                self.settings.grid_color,
                (0, y * self.settings.cell_size),
                (self.settings.screen_width, y * self.settings.cell_size),
                1,
            )

    def _draw_apple(self, surface: pygame.Surface) -> None:
        ax, ay = self.apple
        center_x = ax * self.settings.cell_size + self.settings.cell_size / 2
        center_y = ay * self.settings.cell_size + self.settings.cell_size / 2
        pulse = 0.92 + 0.08 * sin(pygame.time.get_ticks() / 140.0)
        size = int((self.settings.cell_size - 8) * pulse)
        apple_rect = pygame.Rect(0, 0, size, size)
        apple_rect.center = (int(center_x), int(center_y))
        pygame.draw.rect(surface, self.settings.apple_color, apple_rect, border_radius=6)

    def _draw_snake(self, surface: pygame.Surface) -> None:
        alpha = self._interp_alpha
        for index, (sx, sy) in enumerate(self.snake.segments):
            prev_x, prev_y = self._previous_segment_for_index(index)
            draw_x = self._lerp(prev_x, sx, alpha)
            draw_y = self._lerp(prev_y, sy, alpha)

            segment_rect = pygame.Rect(
                int(draw_x * self.settings.cell_size),
                int(draw_y * self.settings.cell_size),
                self.settings.cell_size,
                self.settings.cell_size,
            )
            color = self.settings.snake_head_color if index == 0 else self.settings.snake_color
            pygame.draw.rect(surface, color, segment_rect.inflate(-3, -3), border_radius=6)

    def _draw_hud(self, surface: pygame.Surface, font: pygame.font.Font) -> None:
        self._draw_text(surface, font, f"Score: {self.state.score}", (12, 10))
        self._draw_text(surface, font, f"Speed: {self._current_speed():.1f}x", (12, 30))

        if not self.state.started:
            self._draw_text(surface, font, "Press SPACE to start", (self.settings.screen_width // 2 - 88, self.settings.screen_height // 2 - 12))
        elif self.state.paused and not self.state.game_over:
            self._draw_text(surface, font, "Paused", (self.settings.screen_width // 2 - 28, self.settings.screen_height // 2 - 12))
        elif self.state.game_over:
            self._draw_text(surface, font, "Game Over", (self.settings.screen_width // 2 - 45, self.settings.screen_height // 2 - 28))
            self._draw_text(surface, font, "SPACE or R to restart", (self.settings.screen_width // 2 - 95, self.settings.screen_height // 2 - 6))

    def _draw_text(
        self,
        surface: pygame.Surface,
        font: pygame.font.Font,
        text: str,
        position: tuple[int, int],
    ) -> None:
        label = font.render(text, True, self.settings.text_color)
        surface.blit(label, position)

    async def run(self) -> None:
        '''Boucle principale non bloquante pour execution navigateur via Pygbag.'''
        self.setup()
        assert self._clock is not None

        while self.state.running:
            for event in pygame.event.get():
                self.handle_event(event)

            self.update(pygame.time.get_ticks())
            self.draw()
            self._clock.tick(self.settings.fps)

            # Necessaire pour laisser le controle a l'event loop navigateur.
            await asyncio.sleep(0)

        pygame.quit()


async def main() -> None:
    '''Point d'entree asynchrone compatible desktop et Pygbag.'''
    game = SnakeGame(Settings())
    await game.run()


if __name__ == "__main__":
    asyncio.run(main())


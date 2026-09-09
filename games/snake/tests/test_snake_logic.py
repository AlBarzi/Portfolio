import unittest

from snake import DOWN, LEFT, RIGHT, Settings, SnakeGame, SnakeModel, UP


class SnakeModelTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(grid_width=10, grid_height=10)
        self.model = SnakeModel(self.settings)

    def test_initial_snake_has_three_segments(self) -> None:
        self.assertEqual(len(self.model.segments), 3)

    def test_reverse_direction_is_ignored(self) -> None:
        self.model.queue_direction(LEFT)
        self.assertEqual(self.model.queued_direction, RIGHT)

    def test_valid_direction_change_is_applied(self) -> None:
        self.model.queue_direction(UP)
        self.assertEqual(self.model.queued_direction, UP)


class SnakeGameLogicTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(grid_width=8, grid_height=6, base_speed=8.0)
        self.game = SnakeGame(self.settings)
        self.game.state.started = True

    def test_apple_spawns_outside_snake(self) -> None:
        self.assertNotIn(self.game.apple, self.game.snake.segments)

    def test_eating_apple_increases_score(self) -> None:
        head_x, head_y = self.game.snake.segments[0]
        self.game.apple = (head_x + 1, head_y)
        self.game._last_move_ms = 0

        self.game.update(1000)

        self.assertEqual(self.game.state.score, 1)
        self.assertEqual(len(self.game.snake.segments), 4)

    def test_wall_collision_sets_game_over(self) -> None:
        self.game.snake.segments = [(self.settings.grid_width - 1, 1), (self.settings.grid_width - 2, 1), (self.settings.grid_width - 3, 1)]
        self.game.snake.direction = RIGHT
        self.game.snake.queued_direction = RIGHT
        self.game._last_move_ms = 0

        self.game.update(1000)

        self.assertTrue(self.game.state.game_over)


if __name__ == "__main__":
    unittest.main()


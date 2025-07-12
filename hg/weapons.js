export const WEAPONS = {
    coconut: {
        name: 'coconut',
        damage: (round, isCritical) => {
            const base = 3 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered Desireus' coconuts!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws a coconut at <@${target.id}> with incredible force, dealing ${damage} damage!`
                : `<@${attacker.id}> throws a coconut at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    axe: {
        name: 'axe',
        damage: (round, isCritical) => {
            const base = 4 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a mighty axe!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the axe at <@${target.id}> with devastating force, dealing ${damage} damage!`
                : `<@${attacker.id}> swings the axe at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    pistol: {
        name: 'pistol',
        damage: (round, isCritical) => {
            const base = 5 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a pistol!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> fires the pistol at <@${target.id}> with deadly accuracy, dealing ${damage} damage!`
                : `<@${attacker.id}> fires the pistol at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    cookies: {
        name: 'cookies',
        damage: (round, isCritical) => {
            const base = 2 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a bag of cookies!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws cookies at <@${target.id}> with surprising force, dealing ${damage} damage!`
                : `<@${attacker.id}> throws cookies at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    excalibur: {
        name: 'Excalibur',
        damage: (round, isCritical) => {
            const base = 6 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered the legendary sword Excalibur!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> strikes with Excalibur at <@${target.id}>, dealing ${damage} damage with a mighty blow!`
                : `<@${attacker.id}> strikes at <@${target.id}> with Excalibur, dealing ${damage} damage.`;
        }
    },

    bow: {
        name: 'bow',
        damage: (round, isCritical) => {
            const base = 3 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a bow!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> shoots an arrow from the bow at <@${target.id}>, dealing ${damage} damage with deadly precision!`
                : `<@${attacker.id}> shoots an arrow at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    mace: {
        name: 'mace',
        damage: (round, isCritical) => {
            const base = 4 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a heavy mace!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the mace at <@${target.id}>, dealing ${damage} damage with a crushing blow!`
                : `<@${attacker.id}> swings the mace at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    rat: {
        name: 'rat',
        damage: (round, isCritical) => {
            const base = 1 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a rat!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> unleashes a rat at <@${target.id}>, dealing ${damage} damage with a vicious bite!`
                : `<@${attacker.id}> sends a rat at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    blueguitar: {
        name: 'blue guitar',
        damage: (round, isCritical) => {
            const base = 2 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a blue guitar!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> strums the blue guitar at <@${target.id}>, dealing ${damage} damage with a rockin' riff!`
                : `<@${attacker.id}> throws the blue guitar at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    banhammer: {
        name: 'banhammer',
        damage: (round, isCritical) => {
            const base = 10 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered the legendary banhammer!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the banhammer at <@${target.id}>, dealing ${damage} damage with a thunderous strike!`
                : `<@${attacker.id}> swings the banhammer at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    javascript: {
        name: 'JavaScript',
        damage: (round, isCritical) => {
            const base = 7 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered the power of JavaScript!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> unleashes a JavaScript attack on <@${target.id}>, dealing ${damage} damage with a powerful script!`
                : `<@${attacker.id}> attacks <@${target.id}> with JavaScript, dealing ${damage} damage.`;
        }
    },

    slipper: {
        name: 'slipper',
        damage: (round, isCritical) => {
            const base = 2 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a slipper!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws a slipper at <@${target.id}>, dealing ${damage} damage with a swift kick!`
                : `<@${attacker.id}> throws a slipper at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    metronome: {
        name: 'metronome',
        damage: (round, isCritical) => {
            const base = 3 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a metronome!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> strikes with the metronome at <@${target.id}>, dealing ${damage} damage with perfect timing!`
                : `<@${attacker.id}> attacks <@${target.id}> with the metronome, dealing ${damage} damage.`;
        }

    },

    pinklightsaber: {
        name: 'pink lightsaber',
        damage: (round, isCritical) => {
            const base = 8 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a pink lightsaber!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> swings the pink lightsaber at <@${target.id}>, dealing ${damage} damage with a graceful strike!`
                : `<@${attacker.id}> attacks <@${target.id}> with the pink lightsaber, dealing ${damage} damage.`;
        }
    },

    bananapeellauncher: {
        name: 'bananapeellauncher',
        damage: (round, isCritical) => {
            const base = 6 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a banana peeler launcher!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> launches a banana peeler at <@${target.id}>, dealing ${damage} damage with a slippery surprise!`
                : `<@${attacker.id}> launches a banana peeler at <@${target.id}>, dealing ${damage} damage.`;
        }
    },

    masterball: {
        name: 'Master Ball',
        damage: (round, isCritical) => {
            const base = 10 * round;
            return isCritical ? base * 2 : base;
        },
        discovery: (player) => `<@${player.id}> discovered a Master Ball!`,
        attack: (attacker, target, round) => {
            const isCritical = Math.random() < 0.2;
            const damage = this.damage(round, isCritical);
            target.takeDamage(damage);

            return isCritical
                ? `<@${attacker.id}> throws the Master Ball at <@${target.id}>, dealing ${damage} damage with a legendary capture!`
                : `<@${attacker.id}> throws the Master Ball at <@${target.id}>, dealing ${damage} damage.`;
        }
    },
};
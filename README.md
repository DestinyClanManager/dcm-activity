# dcm-activity

[![Build status](https://heymrcarter.visualstudio.com/Destiny%20Clan%20Manager/_apis/build/status/DCM-Activity)](https://heymrcarter.visualstudio.com/Destiny%20Clan%20Manager/_build/latest?definitionId=21)
![Release status](https://heymrcarter.vsrm.visualstudio.com/_apis/public/Release/badge/7e5f3784-dda9-4bf0-9c99-7bde292990b9/7/19)

> Activity subsystem for Destiny Clan Manager

## Workers

### `getRegisteredClans`

Publishes a notification for each registered `clanId`

|                       |                |
| --------------------- | -------------- |
| **Trigger**           | `rate(6hours)` |
| **Input payload**     | none           |
| **Published payload** | `clanId`       |

### `garbageCollector`

Purges activity profiles for members that have been removed from a given clan

|                       |                                                          |
| --------------------- | -------------------------------------------------------- |
| **Trigger**           | `registered_clan` and `garbage_collection` notifications |
| **Input payload**     | `clanId`                                                 |
| **Published payload** | none                                                     |

### `rosterWorker`

Publishes a notification for each member of a given clan

|                       |                                            |
| --------------------- | ------------------------------------------ |
| **Trigger**           | `registered_clan` notifications            |
| **Input payload**     | `clanId`                                   |
| **Published payload** | `{ clanId, membershipId, membershipType }` |

### `profileWorker`

Creates an [`ActivityProfile`](#ActivityProfile) for a given member and saves it

|                       |                                            |
| --------------------- | ------------------------------------------ |
| **Trigger**           | `clan_member` notifications                |
| **Input payload**     | `{ clanId, membershipId, membershipType }` |
| **Published payload** | none                                       |

## Endpoints

### `startActivityReport`

Manually starts curating [`ActivityProfiles`](#ActivityProfile) for a given clan

|                    |                          |
| ------------------ | ------------------------ |
| **Trigger**        | `POST /inactive-members` |
| **Request body**   | `{ clanId }`             |
| **Response body**  | none                     |
| **Success status** | `201`                    |
| **Error status**   | `500`                    |

### `getInactiveMembers`

Returns all [`ActivityProfiles`](#ActivityProfile) for a given clan

|                    |                                        |
| ------------------ | -------------------------------------- |
| **Trigger**        | `GET /inactive-members/{clanId}`       |
| **Request body**   | none                                   |
| **Response body**  | [`[ActivityProfile]`](ActivityProfile) |
| **Success status** | `200`                                  |
| **Error status**   | `500`                                  |

### `startGarbageCollection`

Manually starts purging members who are no longer in a given clan from the clan's [`ActivityProfiles`](#ActivityProfile)

|                    |                                            |
| ------------------ | ------------------------------------------ |
| **Trigger**        | `POST /inactive-members/{clanId}/clean-up` |
| **Request body**   | none                                       |
| **Response body**  | none                                       |
| **Success status** | `201`                                      |
| **Error status**   | `500`                                      |

## Resources

### `ActivityProfile`

| Property              | Type       | Description                                                                                     |
| --------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `membershipId`        | `String`   | The membershipId associated with the member on a given platform (Xbox, PlayStation, Battle.net) |
| `gamertag`            | `String`   | The display name of a member on a given platform                                                |
| `dateLastPlayed`      | `Date`     | The date of the member's last Destiny 2 session                                                 |
| `expansions`          | `[String]` | An array of Destiny 2 expansions the member owns                                                |
| `characterIds`        | `[String]` | An array of IDs for each character the member has on a given account                            |
| `daysSinceLastPlayed` | `Number`   | The number of days since the member's last Destiny 2 session                                    |
| `isInactive`          | `Boolean`  | Whether or not the member's last session was 30 days or more ago                                |

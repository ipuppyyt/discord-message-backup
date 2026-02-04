import logger from "../logger";
import { SlashCommandType } from "../types";
import {
  SlashCommandBuilder,
  Channel,
  ChatInputCommandInteraction,
  TextChannel,
  Guild,
  EmbedBuilder,
  Message,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("backup")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to backup")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("The server ID to backup to")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("destinationchannel")
        .setDescription("The channel to backup to")
        .setRequired(true),
    )
    .setDescription(
      "Backs up the channel contents into any channel to any server",
    ),
  global: false,
  async execute(interaction: ChatInputCommandInteraction, client) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel") as Channel;
    const server = interaction.options.getString("server") as string;
    const destinationchannel = interaction.options.getString(
      "destinationchannel",
    ) as string;

    const backupSourceChannel = interaction.guild?.channels.cache.get(
      channel.id,
    ) as TextChannel;
    const backupDestinationServer = interaction.client.guilds.cache.get(
      server,
    ) as Guild;
    const backupDestinationChannel =
      backupDestinationServer?.channels.cache.get(
        destinationchannel,
      ) as TextChannel;

    // Validation
    if (!backupSourceChannel) {
      return interaction.followUp({
        content: "Invalid source channel",
        ephemeral: true,
      });
    }

    if (!backupDestinationServer) {
      return interaction.followUp({
        content: "Invalid destination server",
        ephemeral: true,
      });
    }

    if (!backupDestinationChannel) {
      return interaction.followUp({
        content: "Invalid destination channel",
        ephemeral: true,
      });
    }

    const permissions = backupDestinationChannel.permissionsFor(
      interaction.client.user!,
    );
    if (
      !permissions ||
      !permissions.has(["SendMessages", "EmbedLinks", "AttachFiles"])
    ) {
      return interaction.followUp({
        content:
          "I don't have permission to send messages, embeds, or files to the destination channel",
        ephemeral: true,
      });
    }

    // Create progress embed
    const createProgressEmbed = (
      status: string,
      current: number,
      total: number,
    ) => {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      const progressBarLength = 20;
      const filledLength = Math.round((progressBarLength * current) / total);
      const progressBar =
        "█".repeat(filledLength) + "░".repeat(progressBarLength - filledLength);

      return new EmbedBuilder()
        .setColor(current === total ? 0x00ff00 : 0x0099ff) // Green when complete, blue otherwise
        .setAuthor({
          name: `${client.user?.username ?? "Unknown"} Backup`,
          iconURL: client.user?.avatarURL() ?? undefined,
        })
        .addFields(
          {
            name: "Source Channel",
            value: `#${backupSourceChannel.name}`,
            inline: true,
          },
          {
            name: "Destination Server",
            value: backupDestinationServer.name,
            inline: true,
          },
          {
            name: "Destination Channel",
            value: `#${backupDestinationChannel.name}`,
            inline: true,
          },
          {
            name: "Progress",
            value: `${progressBar} ${percentage}%\n${current}/${total} messages`,
            inline: false,
          },
        )
        .setDescription(status)
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL() ?? undefined,
        });
    };

    try {
      // Fetch all messages (in chronological order)
      logger.info(
        `Starting backup from ${backupSourceChannel.name} to ${backupDestinationChannel.name}`,
      );

      let allMessages: Message[] = [];
      let lastMessageId: string | undefined;
      let fetchedCount = 0;

      // Initial status
      await interaction.editReply({
        embeds: [createProgressEmbed("Fetching messages...", 0, 0)],
      });

      // Fetch all messages in batches
      while (true) {
        const options: { limit: number; before?: string } = { limit: 100 };
        if (lastMessageId) {
          options.before = lastMessageId;
        }

        const messages = await backupSourceChannel.messages.fetch(options);
        if (messages.size === 0) break;

        allMessages.push(...messages.values());
        lastMessageId = messages.last()?.id;
        fetchedCount += messages.size;

        // Update progress every 100 messages
        if (fetchedCount % 100 === 0) {
          await interaction
            .editReply({
              embeds: [
                createProgressEmbed(
                  `Fetched ${fetchedCount} messages...`,
                  0,
                  fetchedCount,
                ),
              ],
            })
            .catch((e) => logger.error(`Failed to update progress: ${e.message}`));
        }

        if (messages.size < 100) break;
      }

      // Sort messages in chronological order (oldest first)
      allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      const totalMessages = allMessages.length;
      logger.info(`Fetched ${totalMessages} messages to backup`);

      if (totalMessages === 0) {
        return interaction.editReply({
          embeds: [
            createProgressEmbed("No messages to backup", 0, 0).setColor(
              0xffaa00,
            ),
          ],
        });
      }

      // Update embed with total count
      await interaction.editReply({
        embeds: [
          createProgressEmbed(
            "Starting backup...",
            0,
            totalMessages,
          ),
        ],
      });

      let successCount = 0;
      let failCount = 0;

      // Send messages with rate limiting
      for (let i = 0; i < allMessages.length; i++) {
        const message = allMessages[i];

        try {
          // Prepare message content
          const contentToSend = message.content || undefined;
          const embedsToSend = message.embeds.length > 0 ? message.embeds : undefined;
          const filesToSend =
            message.attachments.size > 0
              ? message.attachments.map((attachment) => attachment.url)
              : undefined;

          // Skip empty messages
          if (!contentToSend && !embedsToSend && !filesToSend) {
            successCount++;
            continue;
          }

          await backupDestinationChannel.send({
            content: contentToSend,
            embeds: embedsToSend,
            files: filesToSend,
          });

          successCount++;

          // Update progress every 10 messages or on last message
          if ((i + 1) % 10 === 0 || i === allMessages.length - 1) {
            await interaction
              .editReply({
                embeds: [
                  createProgressEmbed(
                    `Backing up messages... (${failCount} failed)`,
                    successCount + failCount,
                    totalMessages,
                  ),
                ],
              })
              .catch((e) => logger.error(`Failed to update progress: ${e.message}`));
          }

          // Rate limiting: Discord allows ~5 messages per second
          // Adding a small delay to be safe
          await new Promise((resolve) => setTimeout(resolve, 250));
        } catch (error: any) {
          failCount++;
          logger.error(
            `Failed to send message ${i + 1}/${totalMessages}: ${error.message}`,
          );

          // If we hit rate limits, wait longer
          if (error.code === 429) {
            const retryAfter = error.retry_after || 5000;
            logger.warn(`Rate limited, waiting ${retryAfter}ms`);
            await new Promise((resolve) => setTimeout(resolve, retryAfter));
            // Retry this message
            i--;
            failCount--;
          }
        }
      }

      // Final status
      const finalStatus =
        failCount > 0
          ? `Backup completed with ${failCount} failed message(s)`
          : "Backup completed successfully! ✅";

      await interaction.editReply({
        embeds: [
          createProgressEmbed(finalStatus, totalMessages, totalMessages),
        ],
      });

      logger.info(
        `Backup completed: ${successCount} successful, ${failCount} failed`,
      );
    } catch (error: any) {
      logger.error(`Backup failed: ${error.message}`);
      await interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription(`❌ Backup failed: ${error.message}`)
              .setTimestamp(),
          ],
        })
        .catch((e) => logger.error(e.message));
    }
  },
} as SlashCommandType;
require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every Longpost::Application.config.image_schedule_timer do
  path = Rails.root.join('public', Longpost::Application.config.image_path)

  Dir.foreach(path) do |item|
    next if item == '.' or item == '..'
    file = path + item
    div = (DateTime.now.to_i - File.ctime(file).to_i)

    if div > Longpost::Application.config.image_ttl
      File.delete(path + item)
    end
  end
end